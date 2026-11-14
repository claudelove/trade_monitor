import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import screen from '../web/screens/0110-account.js';
const settle=async()=>{for(let i=0;i<10;i++)await new Promise(r=>setImmediate(r))};
const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main'),pane={};
let calls=[],mode='missing',resolveOld;
const revision='r1';
const ctx={strategy:{account:null},state:{choices:[]},signal:new AbortController().signal,actions:{api:async(path,options)=>{
 calls.push([path,options]);assert.ok(!options.method,'read-only portfolio');
 if(mode==='offline')throw Error('Public preview / protected reads disabled');
 if(path.endsWith('/accounts'))return [{account_id:'demo_a',environment:'demo'},{account_id:'demo_b',environment:'demo'}];
 const id=path.includes('/demo_b/')?'demo_b':'demo_a';
 if(path.endsWith('/policy'))return {account_id:id,revision,body:{capital_limit_krw:'10000000',strategies:[{id:'alpha',capital_krw:'5000000'}]}};
 if(path.endsWith('/demo'))return {account_id:id,worker_alive:true,heartbeat:{status:'WAIT_SESSION',at:'2026-11-14T00:00:00Z'},heartbeat_age_seconds:1,desired:{desired:'RUNNING'}};
 if(mode==='pending')return await new Promise(r=>{resolveOld=r});
 if(mode==='missing')throw Error('INPUT_UNAVAILABLE');
 return {account_id:id,policy_revision:mode==='mismatch'?'old':revision,nav_krw:'10000000',account_pnl_krw:'0',sleeve_pnl_krw:'0',strategies:[{strategy_id:'alpha',equity_krw:'5000000',pnl_krw:'0',contribution_percentage_points:'0'}]};
}}};
function mount(){root.innerHTML=screen.render(ctx,pane);return screen.mount(root,ctx,pane)}
let off=mount();await settle();
assert.match(root.textContent,/demo_a/);assert.match(root.textContent,/WAIT_SESSION/);assert.match(root.textContent,/10,000,000/);assert.match(root.textContent,/alpha/);assert.match(root.textContent,/Valuation unavailable/);assert.match(root.querySelector('[data-operating-body]').textContent,/—/);assert.ok(calls.length===4);off();
mode='complete';off=mount();await settle();assert.match(root.textContent,/VALUATION/);const numeric=[...root.querySelectorAll('td.numeric')].map(e=>e.textContent);assert.ok(numeric.some(v=>/^0(?:\.0+)?$/.test(v)),'genuine zero PnL remains zero');off();
mode='mismatch';off=mount();await settle();assert.match(root.textContent,/Valuation unavailable/,'a different policy cannot supply account PnL');off();
mode='pending';off=mount();await settle();const select=root.querySelector('select');select.value='demo_b';select.dispatchEvent(new dom.window.Event('change'));mode='missing';resolveOld({account_id:'demo_a',policy_revision:revision,nav_krw:'999999999'});await settle();assert.equal(pane.operatingAccount,'demo_b');assert.ok(!root.textContent.includes('999,999,999'),'old account response discarded');off();
mode='pending';off=mount();await settle();off();const before=root.innerHTML;resolveOld({account_id:'demo_b',policy_revision:revision,nav_krw:'123'});await settle();assert.equal(root.innerHTML,before,'cleanup discards late results');
mode='offline';off=mount();await settle();assert.match(root.textContent,/OPERATING SERVICE UNAVAILABLE/);assert.equal(root.querySelector('[data-operating-body]').textContent,'');off();
dom.window.close();console.log('Portfolio: operating account without research, partial inputs, zero vs missing, revision isolation, selection races, cleanup and read-only preview passed.');
