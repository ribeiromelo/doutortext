import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';

const origin = 'http://127.0.0.1:3000';
const username = 'editor.preview';
const password = 'LocalEditorPreview-2026!';
async function request(path, method='GET', body, cookie) {
  const form = path === '/login' || path === '/register';
  const res = await fetch(origin+path,{method,redirect:'manual',headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'}:{})},body:body?(form?new URLSearchParams(body):JSON.stringify(body)):undefined});
  return res;
}
let login = await request('/login','POST',{login:username,password});
if(login.status!==302){await request('/register','POST',{username,email:username+'@example.invalid',password,password_confirm:password});login=await request('/login','POST',{login:username,password})}
assert.equal(login.status,302);const cookie=login.headers.get('set-cookie').split(';')[0];
let folders=(await (await request('/api/folders','GET',undefined,cookie)).json()).folders;
async function folder(name,parent_id=null){const old=folders.find(f=>f.name===name&&f.parent_id===parent_id);if(old)return old.id;const data=await(await request('/api/folders','POST',{name,parent_id},cookie)).json();folders.push(data.folder);return data.folder.id}
const routine=await folder('Rotina e plantão');await folder('Modelos de anotação',routine);await folder('Revisões',routine);const study=await folder('Estudos e referências');await folder('Materiais de consulta',study);await folder('Arquivo pessoal');
const legacy='<div><b>ROTEIRO DE REVISÃO</b></div><div>Material fictício para conferir a formatação.</div><div><br></div><div><b>Antes de começar</b></div><div>Separar referências e organizar as pendências do dia.</div><div><ul><li>Revisar as anotações anteriores.</li><li><u>Conferir os pontos importantes.</u></li></ul></div><div><br></div><div><b>Próximas etapas</b></div><div><table><tbody><tr><th>Etapa</th><th>Organização</th></tr><tr><td>Leitura</td><td><i>Reservar um momento para revisar.</i></td></tr><tr><td>Referências</td><td>Guardar os materiais por assunto.</td></tr></tbody></table></div><div>Consulte a <a href="https://example.com">referência de demonstração</a>.</div>';
const definitions=[['Roteiro de revisão',legacy,routine],['Resumo da semana','<p><strong>Prioridades da semana</strong></p><ol><li>Revisar os materiais.</li><li>Organizar as ideias.</li></ol>',study],['Texto simples e comparações','TEXTO SIMPLES\n\nExemplo: valor < 10 e valor > 2.\nLinha seguinte com acentuação: revisão, atenção, organização.',null],['HTML aninhado antigo','<div>Primeira linha<div><b>Segunda linha em negrito</b></div><div>Terceira linha<br>Quarta linha</div></div>',null],['HTML não confiável','<div><strong>Texto seguro de demonstração</strong><img src="x" onerror="window.__unsafe=1"><script>window.__unsafe=2</script><a href="javascript:window.__unsafe=3">Link inválido</a></div>',null]];
const existing=(await(await request('/api/notes','GET',undefined,cookie)).json()).notes;const fixtures=[];
for(const [title,content,folder_id] of definitions){const old=existing.find(n=>n.title===title);if(old){fixtures.push(old);continue}const data=await(await request('/api/notes','POST',{title,content,folder_id},cookie)).json();assert.ok(data.note);fixtures.push(data.note)}
const note=fixtures[0];const shares=await(await request('/api/notes/'+note.id+'/shares','GET',undefined,cookie)).json();let share=shares.shares.find(s=>s.is_active&&s.permission==='view');if(!share){share=(await(await request('/api/notes/'+note.id+'/shares','POST',{permission:'view'},cookie)).json()).share}
// This file is ignored and contains only local synthetic data and a local share token.
writeFileSync('.wrangler/editor-fixtures.json',JSON.stringify({username,noteId:note.id,legacy,originalVersion:note.version,sharePath:'/s/'+share.share_token,notes:fixtures.map(n=>({id:n.id,title:n.title}))},null,2));
console.log(JSON.stringify({username,noteId:note.id,originalVersion:note.version,sharePath:'/s/'+share.share_token,fixtureCount:fixtures.length}));
