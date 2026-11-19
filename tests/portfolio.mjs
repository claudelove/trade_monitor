import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import screen from '../web/screens/0110-account.js';
const settle=async()=>{for(let i=0;i<10;i++)await new Promise(r=>setImmediate(r))};
const dom=new JSDOM('<main></main>'),root=dom.window.document.querySelector('main');let count=1,mode='missing',writes=0;
const ctx={signal:new AbortController().signal,actions:{api:async path=>{
 if(path.endsWith('/accounts'))return Array.from({length:count},(_,i)=>({account_id:'account'+i,environment:'demo'}));
 if(path.endsWith('/policy'))return {account_id:'account0',revision:'r',body:{capital_limit_krw:'1000',strategies:[{id:'alpha',capital_krw:'500'}]}};
 if(path.endsWith('/demo'))return {account_id:'account0',heartbeat:{status:'PAUSED'},desired:{desired:'PAUSED'}};
 if(mode==='missing')throw Error('INPUT_UNAVAILABLE');return {account_id:'account0',policy_revision:mode==='mismatch'?'old':'r',nav_krw:'1000',account_pnl_krw:'0',sleeve_pnl_krw:'0',strategies:[{strategy_id:'alpha',pnl_krw:'0'}]};
},operation:()=>{writes++;throw Error('read only')}}};
function mount(){root.innerHTML=screen.render(ctx,{});return screen.mount(root,ctx,{})}
let off=mount();await settle();assert.equal(root.querySelector('select'),null);assert.match(root.textContent,/PAUSED/);assert.match(root.textContent,/Valuation unavailable/);assert.match(root.textContent,/alpha/);off();
mode='complete';off=mount();await settle();assert.match(root.textContent,/VALUATION/);assert.ok([...root.querySelectorAll('td.numeric')].some(e=>/^0(?:\.0+)?$/.test(e.textContent)));off();
mode='mismatch';off=mount();await settle();assert.match(root.textContent,/Valuation unavailable/);off();
count=2;off=mount();await settle();assert.match(root.textContent,/Multiple accounts/);assert.equal(root.querySelector('[data-operating-body]').textContent,'');off();assert.equal(writes,0);dom.window.close();console.log('Single account portfolio: no selector, ambiguity blocked, missing/zero/revision boundaries preserved.');
