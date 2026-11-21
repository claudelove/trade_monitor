import assert from 'node:assert/strict';
import {EngineClient,api,operation} from '../web/engine-client.js';
import {nativeAccount,nativeRun} from './native-fixtures.mjs';
const account=nativeAccount(),single=nativeRun('standalone');delete single.account_id;
const requests=[];
const response=path=>path==='/api/accounts'?[{id:account.id,name:account.name,status:account.status}]:path==='/api/runs'?[{id:single.id,strategy:'standalone',created:'2026-11-04',account_id:null}]:path==='/api/monitor/snapshot'?{version:'v1',prices:{},events:[],news:[],sources:[]}:
 path.startsWith('/api/accounts/')?structuredClone(account):structuredClone(single);
const c=new EngineClient(async path=>{requests.push(path);return response(path)});
let value=await c.load();assert.equal(value.report.runs.length,1);assert.equal(value.selected,'account:'+account.id);assert.equal(value.report.account.status,'completed_with_errors');
value=await c.load('run:standalone');assert.equal(value.report.account,null);assert.ok(requests.every(p=>p.startsWith('/api/')));
const partial=new EngineClient(async path=>{if(path==='/api/monitor/snapshot')throw Error('event database unavailable');return response(path)});
value=await partial.load();assert.equal(value.report.account.id,account.id);assert.equal(value.data,null);assert.match(value.marketError,/unavailable/);
let release;const firstGate=new Promise(resolve=>{release=resolve});let n=0;
const racing=new EngineClient(async path=>{if(path==='/api/accounts'&&n++===0){await firstGate;throw Error('late obsolete failure')}return response(path)});
const old=racing.load('account:'+account.id);const newer=await racing.load('run:standalone');release();
assert.equal(newer.report.runs[0].id,'standalone');assert.equal(await old,null);assert.equal(racing.selected,'run:standalone');
for(const url of ['https://public.invalid/api/accounts','//public.invalid/api/accounts','/private/key'])await assert.rejects(api(url));
assert.equal(account.status,'completed_with_errors');
console.log('Engine client passed: native account/standalone, independent source failure, stale response/error rejection and same-origin-only requests.');

const savedFetch=globalThis.fetch,posts=[];
try{
 globalThis.fetch=async(path,options)=>{posts.push({path,options});return {ok:true,json:async()=>({accepted:true})}};
 for(const path of ['/api/v1/operations/program/check','/api/v1/operations/program/apply','/api/v1/data/retention/policy']){
  assert.deepEqual(await operation(path,{reviewed:true}),{accepted:true});
 }
 for(const path of ['/api/admin/shell','https://invalid.example/api/v1/operations/program/apply','//invalid.example/api/v1/data/retention/policy'])await assert.rejects(operation(path,{}));
 assert.equal(posts.length,3);
 for(const {options} of posts){assert.equal(options.method,'POST');assert.equal(options.credentials,'same-origin');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert.equal(options.headers['Content-Type'],'application/json')}
}finally{globalThis.fetch=savedFetch}
console.log('Operating code check/apply and retention use exact allowlisted same-origin POSTs; unknown/cross-origin writes rejected.');
