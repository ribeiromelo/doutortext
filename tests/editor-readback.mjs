import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Run after the local browser checks with tests/editor-fixtures.mjs.
// All fixtures and credentials are synthetic and only target localhost.
const fixture = JSON.parse(readFileSync('.wrangler/editor-fixtures.json','utf8'));
const origin = 'http://127.0.0.1:3000';
const login = await fetch(origin+'/login',{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({login:fixture.username,password:'LocalEditorPreview-2026!'})});
assert.equal(login.status,302);
const cookie = login.headers.get('set-cookie').split(';')[0];
const {note} = await (await fetch(origin+'/api/notes/'+fixture.noteId,{headers:{Cookie:cookie}})).json();
assert.match(note.content,/<strong>ROTEIRO DE REVISÃO<\/strong>/);
assert.match(note.content,/<strong>Linha de teste em negrito\.<\/strong>/);
assert.match(note.content,/<u>Teste de edição compartilhada\.<\/u>/);
assert.match(note.content,/<table/);
assert.match(note.content,/<u>Conferir os pontos importantes\.<\/u>/);
assert.match(note.content,/<em>Reservar um momento para revisar\.<\/em>/);
for(const untouched of fixture.notes.filter(n=>n.id!==fixture.noteId)) {
  const data=await(await fetch(origin+'/api/notes/'+untouched.id,{headers:{Cookie:cookie}})).json();
  assert.equal(data.note.version,1,`${untouched.title} was modified merely by opening it`);
}
const output = execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','execute','doutortext-production','--local','--json','--command',`SELECT content FROM note_revisions WHERE note_id = ${fixture.noteId} AND version = 1 ORDER BY id LIMIT 1`],{encoding:'utf8'});
assert.equal(JSON.parse(output)[0].results[0].content,fixture.legacy,'original snapshot must retain exact legacy HTML');
console.log('PASS: rich owner/shared saves preserved formatting; untouched notes retained version 1; original HTML remains in the revision snapshot.');
