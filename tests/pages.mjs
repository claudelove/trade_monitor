import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runBacktest,eventStudy} from '../web/analytics.js';
import {api} from '../web/static-api.js';
import {JSDOM} from 'jsdom';
const fixtures=JSON.parse(readFileSync('work/pages-parity.json','utf8'));
function compare(actual,expected,path='result'){
 if(typeof expected==='number'){assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-10,path+': '+actual+' != '+expected);return}
 if(expected===null||typeof expected!=='object'){assert.equal(actual,expected,path);return}
 assert.deepEqual(Object.keys(actual).sort(),Object.keys(expected).sort(),path);
 for(const key of Object.keys(expected))compare(actual[key],expected[key],path+'.'+key);
}
for(const test of fixtures.cases){const result=runBacktest(fixtures.snapshots[test.snapshot],test.params);delete result.assumptions;compare(result,test.expected)}
for(const test of fixtures.studies)compare(eventStudy(test.event,fixtures.snapshots[test.snapshot].prices,'069500'),test.expected);
assert.throws(()=>runBacktest(fixtures.snapshots[0],{holding:0}));
assert.throws(()=>runBacktest(fixtures.snapshots[0],{start:'2026-10-01',end:'2026-09-01'}));
const originalFetch=globalThis.fetch;
globalThis.fetch=async url=>{const name=new URL(url).pathname.split('/').pop();assert.ok(['live.json','demo.json'].includes(name));return {ok:true,json:async()=>JSON.parse(readFileSync('dist/assets/data/'+name,'utf8'))}};
const live=await api('/api/snapshot?mode=live');assert.equal(live.mode,'live');assert.ok(live.events.length>0);
live.events=[];assert.ok((await api('/api/snapshot?mode=live')).events.length>0,'cached payload must be copied');
const result=await api('/api/backtest',{mode:'demo',strategy:'buyback',holding:5,cost_bps:20,min_value:0});assert.ok(result.count>0);
await assert.rejects(api('/api/refresh',{}),/GitHub Actions/);
const html=readFileSync('dist/index.html','utf8');assert.ok(!html.includes('="/assets/'));assert.ok(html.includes('data-hosting="pages"'));assert.ok(html.includes('href="./"'));
const dom=new JSDOM(html,{url:'https://claudelove.github.io/trade_monitor/',runScripts:'outside-only'}),w=dom.window;
w.staticModule={api};w.scrollTo=()=>{};let opened='';w.open=url=>{opened=url};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};
w.eval(readFileSync('web/app.js','utf8').replace("await import('./static-api.js')",'await Promise.resolve(window.staticModule)'));
const settle=()=>new Promise(r=>setTimeout(r,30));await settle();
assert.match(w.document.querySelector('#banner').textContent,/GITHUB PAGES/);
assert.ok(w.document.querySelectorAll('[data-event]').length>0);
w.document.querySelector('#refresh-button').click();assert.match(opened,/actions\/workflows\/collect-live.yml/);
w.document.querySelector('[data-event]').click();await settle();assert.equal(w.document.querySelector('#event-news-fetch'),null);
w.document.querySelector('#detail').close();
w.document.querySelector('#mode').value='demo';w.document.querySelector('#mode').dispatchEvent(new w.Event('change'));await settle();
w.document.querySelector('[data-page="backtest"]').click();w.document.querySelector('#backtest-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();assert.match(w.document.querySelector('#backtest-result').textContent,/시뮬레이션 결과/);
w.close();globalThis.fetch=originalFetch;
console.log('Pages checks passed: '+fixtures.cases.length+' Python/browser backtest parity cases, '+fixtures.studies.length+' event studies, static API, project paths, Pages UI.');
