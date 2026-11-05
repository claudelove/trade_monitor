import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {formatDecimal} from '../web/ui/exact-decimal.js';
import {formatNumber} from '../web/shared/ui/table.js';
import book from '../web/screens/0405-orderbook.js';
import oms from '../web/screens/0503-event-oms.js';
import {executionScreen} from '../web/views/execution.js';
assert.equal(formatDecimal('100.10'),'100.10');assert.equal(formatDecimal('0.0000000001'),'0.0000000001');
assert.equal(formatDecimal('99999999999999999999.1234567890'),'99,999,999,999,999,999,999.1234567890');
assert.equal(formatDecimal('1.001E+3'),'1,001');assert.equal(formatDecimal('1E-10'),'0.0000000001');assert.equal(formatDecimal('-0.00'),'0.00');
for(const v of [null,undefined,false,100,'','NaN','Infinity','<img src=x>','1e1000',' '.repeat(200)])assert.equal(formatDecimal(v),'—');
assert.equal(formatNumber('005930'),'—','generic numbers stay strict; identifiers are never globally coerced');
const at='2026-01-05T01:00:00+00:00',account='SYNTHETIC_ACCOUNT',controller=new AbortController();
const settle=()=>new Promise(resolve=>setImmediate(resolve));
let dom=new JSDOM(book.render({},{symbol:'SYNTHETIC'}));let root=dom.window.document.body;
const original={event:{event_id:'a'.repeat(64),source:'SYNTHETIC_BOOK',received_at:at,available_at:at,payload:{bids:[['100.10',20]],asks:[['100.20',30]],continuity:'UNKNOWN',market_state:'UNKNOWN'}},derived:{quality:'SESSION_UNVERIFIED'},stored_features:[]},before=JSON.stringify(original);
let cleanup=book.mount(root,{signal:controller.signal,actions:{api:async path=>path.includes('?')?{events:[{event_id:'a'.repeat(64)}]}:original,showEvent:()=>{}}},{symbol:'SYNTHETIC'});
await settle();assert.equal(root.querySelector('tbody td').textContent,'100.10');assert.equal(root.querySelectorAll('tbody td.numeric').length,4);assert.equal(JSON.stringify(original),before);assert.match(root.textContent,/SESSION_UNVERIFIED/);cleanup();dom.window.close();
dom=new JSDOM(oms.render());root=dom.window.document.body;
cleanup=oms.mount(root,{signal:controller.signal,actions:{api:async()=>({configured:true,control:{halted:false},sampled_at:at,orders:[{updated_at:at,intent:{strategy_id:'alpha',symbol:'SYNTHETIC',role:'alpha',quantity:2,limit_price:'100.10'},filled:1,state:'PARTIAL',client_id:'synthetic-order',broker_id:'SYNTHETIC_ACK'}],audit:[],next_cursor:0})}});
await settle();assert.match(root.querySelector('[data-oms-orders]').textContent,/100\.10/);assert.match(root.textContent,/PARTIAL/);assert.match(root.textContent,/BROKER DISCONNECTED/);cleanup();dom.window.close();
const ctx={signal:controller.signal,strategy:{account:{id:account},entries:[]},actions:{api:async()=>({account_id:account,as_of:at,updated_at:at,total_orders:1,total_fills:1,truncated:false,orders:[{timestamp:at,strategy_id:'alpha',symbol:'SYNTHETIC',quantity:1,status:'unfilled',client_id:'synthetic-order'}],fills:[{timestamp:at,strategy_id:'alpha',symbol:'SYNTHETIC',quantity:1,price:100,fee:0,slippage:0,client_id:'synthetic-order'}]})}};
for(const fillsOnly of [true,false]){
 const screen=executionScreen(fillsOnly),pane={status:fillsOnly?'rejected':'unfilled'};dom=new JSDOM(screen.render(ctx,pane));root=dom.window.document.body;cleanup=screen.mount(root,ctx,pane);await settle();
 assert.equal(root.querySelectorAll('[data-exec-rows] tbody tr').length,1,'order state filters must not hide actual fills');
 if(fillsOnly)assert.equal(root.querySelector('[data-exec-state]'),null);else assert.ok(Array.from(root.querySelector('[data-exec-state]').options).some(o=>o.value==='unfilled'));
 cleanup();dom.window.close();
}
console.log('Financial display: exact decimal book/OMS prices, strict IDs, unknown continuity, real order states and fill-specific filtering passed.');
