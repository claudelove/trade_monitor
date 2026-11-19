import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import screen from '../web/screens/0504-broker.js';
const settle=async()=>{for(let i=0;i<10;i++)await new Promise(r=>setImmediate(r))};
const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main'),pane={};
let posts=[],pendingCheck,checkDelayed=false,failCommand=false,rev='r1';
const initial='ACCOUNT = {}\nSTRATEGIES = {}\n';
const ctx={signal:new AbortController().signal,actions:{api:async path=>{
 if(path.endsWith('/program'))return {program:initial,account_id:'fixture_account',revision:rev};
 if(path.endsWith('/demo'))return {desired:{desired:'PAUSED',policy_revision:rev},heartbeat:{status:'PAUSED'}};
 if(path.includes('/readiness'))return {constraints:[{code:'ALLOCATION_EXCEEDS_NAV'}]};
 if(path.endsWith('/snapshot'))return {nav_krw:'10000000',positions:{}};
 if(path.endsWith('/execution'))return {orders:[]};throw Error(path);
},operation:async(path,body)=>{posts.push({path,body});
 if(path.endsWith('/check')){if(checkDelayed)return await new Promise(r=>pendingCheck=r);return {review_id:'review',program_sha256:'hash',expected_revision:rev,total_capital_krw:'100',strategies:[],warnings:[]}}
 if(path.endsWith('/apply')){rev='r2';return {revision:rev}}
 if(failCommand)throw Error('Interrupted');return {desired:'RUNNING'};
}}};
function mount(){root.innerHTML=screen.render(ctx,pane);return screen.mount(root,ctx,pane)}
let off=mount();await settle();assert.equal(posts.length,0,'mount never applies or starts');assert.equal(root.querySelector('form'),null);assert.equal(root.querySelector('select'),null);assert.equal(root.querySelector('input'),null);assert.equal(root.querySelector('[data-broker-capture]'),null);assert.equal(root.querySelector('[data-program-source]').value,initial);assert.match(root.textContent,/ALLOCATION_EXCEEDS_NAV/);
let editor=root.querySelector('[data-program-source]');editor.value=initial+'# edited';editor.dispatchEvent(new dom.window.Event('input'));root.querySelector('[data-program-command="start"]').click();await settle();assert.equal(posts.length,0,'unapplied code cannot start');
checkDelayed=true;root.querySelector('[data-program-check]').click();await settle();editor.value+=' again';editor.dispatchEvent(new dom.window.Event('input'));pendingCheck({review_id:'old',program_sha256:'old'});await settle();assert.equal(root.querySelector('[data-program-apply]').disabled,true,'changed content invalidates pending check');
checkDelayed=false;root.querySelector('[data-program-check]').click();await settle();assert.equal(posts.at(-1).body.expected_revision,'r1');assert.equal(root.querySelector('[data-program-apply]').disabled,false);root.querySelector('[data-program-apply]').click();await settle();assert.deepEqual(posts.at(-1).body,{review_id:'review',program_sha256:'hash',reviewed:true});assert.equal(posts.filter(x=>x.path.endsWith('/commands')).length,0,'apply never starts worker');
failCommand=true;root.querySelector('[data-program-command="start"]').click();await settle();const request=posts.at(-1).body.request_id;root.querySelector('[data-program-command="start"]').click();await settle();assert.equal(posts.at(-1).body.request_id,request,'uncertain command retry identity preserved');
editor.value+=' unsaved';editor.dispatchEvent(new dom.window.Event('input'));off();off=mount();await settle();assert.match(root.querySelector('[data-program-source]').value,/unsaved/,'desk switches preserve edits');off();
let done;ctx.actions.api=async path=>path.endsWith('/program')?await new Promise(r=>done=r):{};off=mount();await settle();off();const html=root.innerHTML;done({program:'late',account_id:'x',revision:'r3'});await settle();assert.equal(root.innerHTML,html,'late loads do not mutate disposed screen');
dom.window.close();console.log('Operating code: no account/forms, inert load/check, exact review, edit races, retries and cleanup passed.');
