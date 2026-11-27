import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

// Disposable synthetic data only. Never point this script at a deployed environment.
const origin='http://127.0.0.1:3000', suffix=Date.now().toString(36);
const sql=command=>JSON.parse(execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','doutortext-production','--local','--json','--command',command],{encoding:'utf8',env:{...process.env,WRANGLER_LOG_PATH:'.wrangler/test-logs'}}))[0].results;
async function req(path,{cookie,method='GET',body,form,upload,foreign=false}={}) {
  const headers={Connection:'close',Origin:foreign?'https://foreign.invalid':origin};if(cookie)headers.Cookie=cookie;
  if(body)headers['Content-Type']='application/json';if(form)headers['Content-Type']='application/x-www-form-urlencoded';
  return fetch(origin+path,{method,headers,body:upload || (form?new URLSearchParams(form):body?JSON.stringify(body):undefined),redirect:'manual'});
}
const json=async response=>{assert.equal(response.status,200,await response.clone().text());return response.json()};
const accounts=[];
async function account(prefix){const name='dh_'+prefix+'_'+suffix;const res=await req('/register',{method:'POST',form:{username:name,email:name+'@example.invalid',password:'Dashboard-Test-2026!',password_confirm:'Dashboard-Test-2026!'}});assert.equal(res.status,302,await res.text());const id=sql(`SELECT id FROM users WHERE username='${name}'`)[0].id;accounts.push(id);return{cookie:res.headers.get('set-cookie').split(';')[0],id};}
const a=await account('owner'),b=await account('other'),admin=await account('admin');
sql(`UPDATE users SET is_admin=1 WHERE id=${admin.id}`);
const home=cookie=>req('/api/dashboard/home',{cookie}).then(json);
const listSlides=()=>req('/api/admin/dashboard/slides',{cookie:admin.cookie}).then(json).then(d=>d.slides);
const originals=await listSlides(),created=[];
try {
  assert.equal((await req('/api/dashboard/home')).status,401);
  for(const path of ['/api/admin/dashboard/slides','/api/admin/dashboard/images'])assert.equal((await req(path,{cookie:a.cookie,method:path.endsWith('images')?'POST':'GET'})).status,403);
  assert.equal((await home(a.cookie)).popular.length,0);
  const notes=[];
  for(let i=0;i<6;i++){const res=await req('/api/notes',{cookie:a.cookie,method:'POST',body:{title:'Synthetic home '+i,content:'<div><b>Original '+i+'</b></div>'}});assert.equal(res.status,201);notes.push((await res.json()).note);}
  await home(a.cookie);await home(a.cookie);await req('/api/notes/'+notes[0].id,{cookie:a.cookie});
  assert.equal((await home(a.cookie)).popular.length,0,'GET, list and dashboard refresh must not record access');
  const access=(cookie,id,event_id=randomUUID())=>req('/api/notes/'+id+'/access',{cookie,method:'POST',body:{event_id}});
  assert.equal((await access(b.cookie,notes[0].id)).status,404);
  const same=randomUUID();await Promise.all(Array.from({length:8},()=>access(a.cookie,notes[0].id,same).then(r=>assert.equal(r.status,200))));
  assert.equal(sql(`SELECT access_count FROM note_accesses WHERE user_id=${a.id} AND note_id=${notes[0].id}`)[0].access_count,1,'retry must be idempotent');
  await Promise.all(Array.from({length:20},()=>access(a.cookie,notes[1].id).then(r=>assert.equal(r.status,200))));
  assert.equal(sql(`SELECT access_count FROM note_accesses WHERE user_id=${a.id} AND note_id=${notes[1].id}`)[0].access_count,20,'concurrent increments must be atomic');
  await access(a.cookie,notes[2].id);await access(a.cookie,notes[3].id);
  sql(`UPDATE note_accesses SET last_accessed_at='2020-01-01T00:00:00Z' WHERE user_id=${a.id} AND note_id=${notes[2].id}`);
  let data=await home(a.cookie);assert.equal(data.popular[0].id,notes[1].id);assert.ok(data.popular.findIndex(n=>n.id===notes[3].id)<data.popular.findIndex(n=>n.id===notes[2].id));
  assert.equal((await home(b.cookie)).popular.length,0);
  assert.equal((await req('/api/notes/'+notes[0].id,{cookie:a.cookie,method:'PUT',body:{content:'Updated',version:1}})).status,200);
  assert.equal(sql(`SELECT access_count FROM note_accesses WHERE user_id=${a.id} AND note_id=${notes[0].id}`)[0].access_count,1,'saving must not count as opening');
  sql(`UPDATE notes SET updated_at='2030-01-01 10:05:00' WHERE id=${notes[5].id}`);
  assert.equal((await home(a.cookie)).recent[0].id,notes[5].id);assert.equal((await home(a.cookie)).recent.length,5);
  const columns=sql('PRAGMA table_info(notes)');
  if(columns.some(c=>c.name==='deleted_at')){sql(`UPDATE notes SET deleted_at=CURRENT_TIMESTAMP WHERE id=${notes[1].id}`);assert.ok(!(await home(a.cookie)).popular.some(n=>n.id===notes[1].id));}
  assert.equal((await req('/api/notes/'+notes[0].id,{cookie:a.cookie,method:'DELETE'})).status,200);
  assert.equal(sql(`SELECT COUNT(*) AS total FROM note_accesses WHERE note_id=${notes[0].id}`)[0].total,0,'deletion must cascade');

  const payload={title:'Synthetic slide',description:'Plain text description',image_path:'/static/dashboard/workspace.jpg',image_alt:'Test photo',link_url:'',link_label:'',display_order:99,is_active:false,starts_at:null,ends_at:null};
  for(const extra of [{title:'<script>bad</script>'},{link_url:'javascript:alert(1)',link_label:'Open'},{link_url:'//foreign.invalid',link_label:'Open'},{image_path:'https://foreign.invalid/image.jpg'},{starts_at:'not-a-date'},{starts_at:'2030-02-01T00:00:00Z',ends_at:'2029-01-01T00:00:00Z'}])assert.equal((await req('/api/admin/dashboard/slides',{cookie:admin.cookie,method:'POST',body:{...payload,...extra}})).status,400);
  assert.equal((await req('/api/admin/dashboard/slides',{cookie:admin.cookie,method:'POST',body:payload,foreign:true})).status,403);
  let response=await req('/api/admin/dashboard/slides',{cookie:admin.cookie,method:'POST',body:payload});assert.equal(response.status,201);let slide=(await response.json()).slide;created.push(slide.id);
  assert.ok(!(await home(a.cookie)).slides.some(s=>s.id===slide.id));
  async function update(extra){slide=(await json(await req('/api/admin/dashboard/slides/'+slide.id,{cookie:admin.cookie,method:'PUT',body:{...slide,...extra}}))).slide;}
  await update({is_active:true,starts_at:'2090-01-01T00:00:00Z'});assert.ok(!(await home(a.cookie)).slides.some(s=>s.id===slide.id));
  await update({starts_at:'2020-01-01T00:00:00Z',ends_at:'2091-01-01T00:00:00Z'});assert.ok((await home(a.cookie)).slides.some(s=>s.id===slide.id));
  await update({ends_at:'2021-01-01T00:00:00Z'});assert.ok(!(await home(a.cookie)).slides.some(s=>s.id===slide.id));

  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');
  const imageForm=(data,type)=>{const form=new FormData();form.append('image',new Blob([data],{type}),'synthetic.png');return form;};
  assert.equal((await req('/api/admin/dashboard/images',{cookie:admin.cookie,method:'POST',upload:imageForm(Buffer.from('<svg onload="alert(1)"></svg>'),'image/png')})).status,415);
  assert.equal((await req('/api/admin/dashboard/images',{cookie:admin.cookie,method:'POST',upload:imageForm(Buffer.alloc(750*1024+1),'image/jpeg')})).status,413);
  response=await req('/api/admin/dashboard/images',{cookie:admin.cookie,method:'POST',upload:imageForm(png,'image/png')});assert.equal(response.status,201,await response.clone().text());const image=(await response.json()).image_path;
  assert.equal((await req(image)).status,401);assert.equal((await req(image,{cookie:a.cookie})).status,404);assert.equal((await req(image,{cookie:admin.cookie})).status,200);
  await update({image_path:image,starts_at:null,ends_at:null,is_active:true});response=await req(image,{cookie:a.cookie});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await response.arrayBuffer()),png);
  const stale={...slide};await update({title:'Synthetic edited'});
  assert.equal((await req('/api/admin/dashboard/slides/'+slide.id,{cookie:admin.cookie,method:'PUT',body:stale})).status,409);
  let items=await listSlides(),before=items.map(s=>[s.id,s.display_order]);
  const old=items.map(s=>({id:s.id,version:s.version}));await update({description:'Concurrent admin change'});
  assert.equal((await req('/api/admin/dashboard/slides/reorder',{cookie:admin.cookie,method:'POST',body:{items:old.reverse()}})).status,409);
  assert.deepEqual((await listSlides()).map(s=>[s.id,s.display_order]),before,'stale reordering must not partially write');
  items=await listSlides();const reverse=items.reverse().map(s=>({id:s.id,version:s.version}));const reordered=await json(await req('/api/admin/dashboard/slides/reorder',{cookie:admin.cookie,method:'POST',body:{items:reverse}}));assert.deepEqual(reordered.slides.map(s=>s.id),reverse.map(s=>s.id));
  // Exercise the documented maximum without exceeding Cloudflare D1's 100 bindings.
  const remaining=100-(await listSlides()).length;
  if(remaining>0)sql(`INSERT INTO dashboard_slides(title,image_path,created_by) VALUES ${Array.from({length:remaining},(_,i)=>`('Synthetic capacity ${i}','/static/dashboard/workspace.jpg',${admin.id})`).join(',')}`);
  items=await listSlides();created.push(...items.filter(s=>!originals.some(o=>o.id===s.id)&&!created.includes(s.id)).map(s=>s.id));
  const maximumOrder=items.reverse().map(s=>({id:s.id,version:s.version}));assert.equal(maximumOrder.length,100);
  assert.deepEqual((await json(await req('/api/admin/dashboard/slides/reorder',{cookie:admin.cookie,method:'POST',body:{items:maximumOrder}}))).slides.map(s=>s.id),maximumOrder.map(s=>s.id));
  for(const s of await listSlides())await req('/api/admin/dashboard/slides/'+s.id,{cookie:admin.cookie,method:'PUT',body:{...s,is_active:false}});
  data=await home(a.cookie);assert.equal(data.slides.length,0);assert.equal(data.slides_state,'empty');assert.equal((await req(image,{cookie:a.cookie})).status,404);
  const seeded=(await listSlides()).find(s=>s.id===originals[0].id);
  await req('/api/admin/dashboard/slides/'+seeded.id,{cookie:admin.cookie,method:'PUT',body:{...seeded,title:'Edited seed must survive'}});
  const migration=readFileSync('migrations/0006_dashboard_home.sql','utf8');writeFileSync('.wrangler/dashboard-test-seed.sql',migration.slice(migration.indexOf('INSERT OR IGNORE INTO dashboard_slides')));
  execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','doutortext-production','--local','--file=.wrangler/dashboard-test-seed.sql'],{stdio:'pipe',env:{...process.env,WRANGLER_LOG_PATH:'.wrangler/test-logs'}});
  assert.equal((await listSlides()).find(s=>s.id===seeded.id).title,'Edited seed must survive','idempotent seed must not overwrite admin edits');
  slide=(await listSlides()).find(s=>s.id===slide.id);assert.equal((await req('/api/admin/dashboard/slides/'+slide.id+'?version='+(slide.version-1),{cookie:admin.cookie,method:'DELETE'})).status,409);
  assert.equal((await req('/api/admin/dashboard/slides/'+slide.id+'?version='+slide.version,{cookie:admin.cookie,method:'DELETE'})).status,200);
  console.log('PASS: auth/CSRF; atomic, idempotent and isolated access counts; real recent ordering; trash/deletion; slide CRUD/scheduling/CAS/order; safe image upload/publication; fallback signal; idempotent seed.');
} finally {
  const current=await listSlides();
  for(const original of originals){const now=current.find(s=>s.id===original.id);if(now)await req('/api/admin/dashboard/slides/'+now.id,{cookie:admin.cookie,method:'PUT',body:{...original,version:now.version}});}
  for(const id of created){const now=(await listSlides()).find(s=>s.id===id);if(now)await req('/api/admin/dashboard/slides/'+id+'?version='+now.version,{cookie:admin.cookie,method:'DELETE'});}
  sql(`DELETE FROM users WHERE id IN (${accounts.join(',')})`);
}
