import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import screen from '../web/screens/0412-universe.js';
const flush=()=>new Promise(r=>setImmediate(r));
const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main'),q=s=>root.querySelector(s);
const rule={id:'main',name:'Synthetic pool',markets:['KOSPI'],top_n:2,minimum_listing_days:0,exclude_halted:true,exclude_preferred:true,revision:'c'.repeat(64)};
let settings={default:{id:'main',revision:rule.revision,generation:3},rules:[rule,{...rule,id:'secondary',name:'Other synthetic pool'}],master:{available_at:'2026-11-07T01:00:00Z'},history_credentials_configured:false};
let posts=[],poll,pending=null;
const nativeSetInterval=globalThis.setInterval,nativeClearInterval=globalThis.clearInterval;
globalThis.setInterval=fn=>{poll=fn;return 1};globalThis.clearInterval=()=>{};
const ctx={signal:new AbortController().signal,actions:{
 api:async()=>structuredClone(settings),
 operation:async(path,body)=>{
  posts.push({path,body});
  if(pending)return new Promise(resolve=>{pending.resolve=resolve});
  if(path.endsWith('preview'))return {members:[{rank:1,symbol:'000001',name:'Synthetic',market:'KOSPI',market_cap_krw:'9007199254740993',lot_size:1,listing_date:'2000-01-01'}],eligible_count:3,source:'SYNTHETIC',master_available_at:'2026-11-07T01:00:00Z',snapshot_id:'d'.repeat(64)};
  const current=settings.rules.find(r=>r.id===body.rule.id);
  if((current?.revision||null)!==body.expected_revision||settings.default.generation!==body.expected_default_generation)throw Error('Synthetic revision conflict');
  const saved={...body.rule,revision:'e'.repeat(64)};
  settings.rules=[...settings.rules.filter(r=>r.id!==saved.id),saved];
  settings.default={id:saved.id,revision:saved.revision,generation:settings.default.generation+1};
  return {...saved,default:settings.default};
 }
}};
let off;
try{
 root.innerHTML=screen.render();off=screen.mount(root,ctx,{});await flush();
 assert.equal(q('[data-univ-controls]').disabled,false);assert.match(root.textContent,/KEYS MISSING/);
 q('[data-univ-preview]').click();await flush();assert.equal(posts[0].body.rule.top_n,2);
 assert.match(root.textContent,/9,007,199,254,740,993/);assert.match(root.textContent,/000001/);
 q('[name=top_n]').value='3';q('[name=top_n]').dispatchEvent(new dom.window.Event('input',{bubbles:true}));
 assert.equal(q('[data-univ-members]').textContent,'','edited rules must clear previous preview');
 q('[data-univ-select]').value='secondary';poll();await flush();
 assert.equal(q('[data-univ-select]').value,'secondary','background polling preserves selection');
 assert.equal(q('[name=top_n]').value,'3','background polling preserves unsaved rule');
 q('[data-univ-select]').value='main';
 settings={...settings,default:{...settings.default,revision:'f'.repeat(64),generation:9},rules:[{...rule,revision:'f'.repeat(64),top_n:5},settings.rules[1]]};
 poll();await flush();assert.match(q('[data-univ-status]').textContent,/SETTINGS CHANGED/);
 q('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await flush();
 assert.equal(posts.at(-1).body.expected_revision,rule.revision,'poll cannot advance reviewed rule CAS');
 assert.equal(posts.at(-1).body.expected_default_generation,3,'poll cannot advance reviewed default CAS');
 assert.match(q('[data-univ-status]').textContent,/conflict/);
 q('[data-univ-refresh]').click();await flush();
 assert.equal(q('[name=top_n]').value,'5','explicit reload renders latest saved rule for review');
 q('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await flush();await flush();
 assert.equal(posts.at(-1).body.expected_revision,'f'.repeat(64));assert.equal(posts.at(-1).body.expected_default_generation,9);
 assert.equal(q('[data-univ-select]').value,'main');assert.match(q('[data-univ-status]').textContent,/SAVED/);
 q('[data-univ-select]').value='';q('[data-univ-load]').click();
 assert.equal(q('[name=top_n]').value,'100','NEW RULE resets the form');
 q('[name=id]').value='new_pool';q('form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await flush();await flush();
 assert.equal(posts.at(-1).body.expected_revision,null,'NEW RULE must not inherit prior revision');
 assert.equal(posts.at(-1).body.expected_default_generation,10);
 pending={};q('[data-univ-preview]').click();await flush();
 assert.equal(q('[data-univ-controls]').disabled,true,'disable edits while a request is pending');
 assert.equal(q('[data-univ-load]').disabled,true);
 pending.resolve({members:[],eligible_count:0,source:'SYNTHETIC',master_available_at:'2026-11-07T00:00:00Z',snapshot_id:'d'.repeat(64)});pending=null;await flush();
 assert.equal(q('[data-univ-controls]').disabled,false);
 off();const previous=posts.length;q('[data-univ-preview]').click();await flush();assert.equal(posts.length,previous,'disposed module cannot submit');
 root.innerHTML=screen.render();off=screen.mount(root,{signal:ctx.signal,actions:{api:async()=>{throw Error('Protected host required')}}},{});await flush();
 assert.equal(q('[data-univ-controls]').disabled,true);assert.equal(q('[data-univ-master]').disabled,true);
 off();off=null;
 console.log('Universe UI: protected gating, exact previews, polling selection/draft retention, explicit reload CAS, new-rule reset, pending lock and cleanup.');
}finally{off?.();globalThis.setInterval=nativeSetInterval;globalThis.clearInterval=nativeClearInterval;dom.window.close()}
