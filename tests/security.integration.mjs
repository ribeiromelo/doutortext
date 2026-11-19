import assert from 'node:assert/strict';

// Only run against the disposable local D1 database.
const origin = 'http://127.0.0.1:3000';
const suffix = Date.now().toString(36);
async function request(path, { method='GET', body, cookie, form, foreign=false }={}) {
  const headers = { Origin: foreign ? 'https://foreign.invalid' : origin };
  if (cookie) headers.Cookie = cookie;
  if (body) headers['Content-Type'] = 'application/json';
  if (form) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  return fetch(origin+path,{method,headers,body:form ? new URLSearchParams(form) : body ? JSON.stringify(body) : undefined,redirect:'manual'});
}
async function account(name) {
  const res=await request('/register',{method:'POST',form:{username:name,email:name+'@example.invalid',password:'LocalPreview-2026!',password_confirm:'LocalPreview-2026!'}});
  assert.equal(res.status,302,await res.text());
  return res.headers.get('set-cookie').split(';')[0];
}
const a=await account('test_a_'+suffix), b=await account('test_b_'+suffix);
assert.equal((await request('/api/admin/users',{cookie:a})).status,403,'first signup must not become admin');
assert.equal((await request('/api/notes',{method:'POST',cookie:a,body:{title:'blocked'},foreign:true})).status,403,'CSRF origin');
const note=await (await request('/api/notes',{method:'POST',cookie:a,body:{title:'Security fixture',content:'Original'}})).json();
const id=note.note.id;
const put=(cookie,body)=>request('/api/notes/'+id,{method:'PUT',cookie,body});
assert.equal((await put(a,{title:'Revision',version:1})).status,200);
assert.equal((await put(a,{title:'Stale overwrite',version:1})).status,409,'stale version');
assert.equal((await put(b,{title:'Cross account',version:2})).status,404);
const before=await (await request('/api/notes/'+id+'/history',{cookie:a})).json();
assert.ok(before.history.length);
assert.equal((await request('/api/notes/'+id,{method:'DELETE',cookie:b})).status,404);
const after=await (await request('/api/notes/'+id+'/history',{cookie:a})).json();
assert.deepEqual(after,before,'cross-account deletion cannot alter history');
const folderA=await (await request('/api/folders',{method:'POST',cookie:a,body:{name:'A'}})).json();
const folderB=await (await request('/api/folders',{method:'POST',cookie:b,body:{name:'B'}})).json();
assert.equal((await put(a,{folder_id:folderB.folder.id,version:2})).status,404);
assert.equal((await request('/api/folders/'+folderA.folder.id,{method:'PUT',cookie:a,body:{parent_id:folderB.folder.id}})).status,404);
assert.equal((await request('/api/folders/'+folderA.folder.id,{method:'PUT',cookie:a,body:{parent_id:folderA.folder.id}})).status,400);
const child=await (await request('/api/folders',{method:'POST',cookie:a,body:{name:'Child',parent_id:folderA.folder.id}})).json();
assert.equal((await request('/api/folders/'+folderA.folder.id,{method:'PUT',cookie:a,body:{parent_id:child.folder.id}})).status,400,'cycle');
assert.equal((await request('/api/notes/'+id+'/shares',{method:'POST',cookie:a,body:{permission:'view',shared_with_email:'someone@example.invalid'}})).status,400,'unverified invite must fail closed');
const share=await (await request('/api/notes/'+id+'/shares',{method:'POST',cookie:a,body:{permission:'edit'}})).json();
const token=share.share.share_token;
const payload='</script><script>globalThis.xss=1</script>';
assert.equal((await put(a,{title:payload,content:payload,version:2})).status,200);
const page=await request('/s/'+token);const html=await page.text();
assert.equal(page.headers.get('cache-control'),'no-store');
assert.ok(page.headers.get('content-security-policy').includes('nonce-'));
assert.ok(!html.includes(payload),'script termination must be escaped');
assert.ok(!html.includes('onclick='),'inline event handlers must be absent');
assert.equal((await request('/api/shared/'+token,{method:'PUT',cookie:b,body:{title:'Shared update',content:'New',version:3}})).status,200);
assert.equal((await request('/api/shared/'+token,{method:'PUT',cookie:b,body:{title:'Stale',content:'New',version:3}})).status,409);
const shares=await (await request('/api/notes/'+id+'/shares',{cookie:a})).json();
assert.ok(shares.shares[0].expires_at, 'new shares must expire');
const writes=await Promise.all([put(a,{content:'Concurrent A',version:4}),put(a,{content:'Concurrent B',version:4})]);
assert.deepEqual(writes.map(x=>x.status).sort(),[200,409],'only one concurrent writer can succeed');
await request('/api/shares/'+shares.shares[0].id,{method:'PUT',cookie:a,body:{is_active:false}});
assert.equal((await request('/s/'+token)).status,404);
assert.equal((await request('/api/shared/'+token+'/poll')).status,404);
assert.equal((await request('/api/shared/'+token,{method:'PUT',cookie:b,body:{title:'Denied',content:'',version:4}})).status,403);
// A stable, non-sensitive fixture for visual review on localhost only.
let preview=await request('/login',{method:'POST',form:{login:'ana.design',password:'LocalPreview-2026!'}});
if(preview.status!==302) { await account('ana.design'); preview=await request('/login',{method:'POST',form:{login:'ana.design',password:'LocalPreview-2026!'}}); }
const cookie=preview.headers.get('set-cookie')?.split(';')[0];
assert.ok(cookie,'preview account');
const existing=await (await request('/api/notes',{cookie})).json();
if(!existing.notes.length) for(const [title,content] of [
  ['Referências para revisar','REFERÊNCIAS\n\nSeparar os artigos salvos por assunto.\nRevisar os resumos da semana.'],
  ['Ideias para a semana','PRÓXIMOS PASSOS\n\nOrganizar os materiais de estudo.\nReservar um momento para tirar dúvidas.'],
  ['Um começo mais leve','Nem tudo precisa ficar na memória.\nAlgumas coisas ficam melhores no papel.\n\nPARA HOJE\n\nOrganizar as ideias que surgiram.\nRevisar as referências da semana.\nAbrir espaço para o que vem depois.\n\nLEMBRETES\n\nRegistrar os pontos importantes, um de cada vez.\nVoltar às anotações com calma.']
]) await request('/api/notes',{method:'POST',cookie,body:{title,content}});
console.log('PASS: ownership, history isolation, folder cycles, CSRF, versions, XSS serialization, CSP, sharing and revocation. Local visual fixture ready.');
