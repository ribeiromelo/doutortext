import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Run workspace-fixtures.mjs, then verify with --unchanged before browser edits.
// After appending each fixture marker in its browser pane, run without the flag.
// All requests target synthetic data on localhost only.
const origin='http://127.0.0.1:3000';
const {notes}=JSON.parse(readFileSync('.wrangler/workspace-fixtures.json'));
const login=await fetch(origin+'/login',{method:'POST',redirect:'manual',headers:{Origin:origin,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({login:'editor.preview',password:'LocalEditorPreview-2026!'})});
assert.equal(login.status,302);
const cookie=login.headers.get('set-cookie').split(';')[0];
for (const expected of notes) {
 const {note}=await(await fetch(origin+'/api/notes/'+expected.id,{headers:{Cookie:cookie}})).json();
 assert.equal(note.title,expected.title);
 if(process.argv.includes('--unchanged')){assert.equal(note.version,1);assert.equal(note.content,expected.content);continue;}
 assert.ok(note.version>1);
 assert.ok(note.content.includes(expected.marker),'own pane marker must be saved');
 assert.match(note.content,/<strong>/,'legacy bold must survive');
 for(const other of notes)if(other.id!==expected.id)assert.ok(!note.content.includes(other.marker),'pane content must remain isolated');
}
console.log(process.argv.includes('--unchanged')?'PASS: opening and arranging four editors retained exact original HTML and versions.':'PASS: four browser editors saved only their own changes with legacy formatting intact.');
