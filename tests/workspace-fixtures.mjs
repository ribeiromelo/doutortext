import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const origin='http://127.0.0.1:3000';
const login=await fetch(origin+'/login',{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({login:'editor.preview',password:'LocalEditorPreview-2026!'})});
assert.equal(login.status,302,'Run editor-fixtures.mjs first');
const cookie=login.headers.get('set-cookie').split(';')[0];
const specs=[['Plano do dia','PLANO DO DIA','Separar as prioridades para a manhã.'],['Lista de revisão','LISTA DE REVISÃO','Conferir referências e organizar o material.'],['Referências de estudo','REFERÊNCIAS','Guardar links e ideias para consultar depois.'],['Rascunho da semana','RASCUNHO','Um espaço livre para as próximas ideias.']];
const notes=[];
for (const [title,heading,paragraph] of specs) {
 const content='<div><b>'+heading+'</b></div><div>'+paragraph+'</div>';
 const res=await fetch(origin+'/api/notes',{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({title,content})});assert.equal(res.status,201);
 const {note}=await res.json();notes.push({id:note.id,title,content,marker:'Validação exclusiva do painel '+(notes.length+1)+'.'});
}
writeFileSync('.wrangler/workspace-fixtures.json',JSON.stringify({notes}));
console.log('Created four synthetic local notes for split-editor checks.');
