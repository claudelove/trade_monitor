import {screens} from './screens.js';
import {ChartLinkBus} from './charts/model.js';
import * as analysis from './strategy-analysis.js';
import {WindowWorkspace} from './window-workspace.js';
import * as native from './native-report.js';
import * as terminal from './terminal-ui.js';
import {api,operation,EngineClient} from './engine-client.js';
import {paneContext,selectionBar,bindSelection} from './pane-context.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emptyMarket=()=>({prices:{},events:[],news:[],sources:[],symbols:[],event_types:{disclosure:{name:'Disclosures'}},as_of:null});
const state={mode:'persisted',page:'overview',desk:'strategy',marketSource:'stored',symbol:'',data:emptyMarket(),
  runtime:{runs:[],strategies:[]},nativeReport:null,selectedRunId:null,choices:[],selectedPortfolio:null,
  watch:[],search:'',category:'all',priority:'all',widgets:[{id:'events',show:true}],pollError:null,marketError:null,loading:false,role:null};
const client=new EngineClient(),chartBus=new ChartLinkBus(),pagePanes=new Map();
let pageDispose=()=>{},dialogDispose=()=>{},dialogRequest=0,activeDialog=null,lastVersion=null,pollBusy=false;
const deskIds=['strategy','market','backtest','analysis','execution','admin'];
const desks=Object.fromEntries(deskIds.map(profile=>[profile,new WindowWorkspace({profile,storage:localStorage,onOpenScreen:id=>openTool(id),
  content:p=>{const s=screens.get(p.type),ctx=paneContext(screenContext('window'),p,s);return selectionBar(ctx,p,s)+screens.render(p.type,ctx,p)},
  bind:(root,p)=>{const ctx=paneContext(screenContext('window'),p,screens.get(p.type)),off=bindSelection(root,ctx,p),dispose=screens.mount(p.type,root,ctx,p);return ()=>{off();dispose()}},
  symbols:()=>terminal.securities(displayMarket())})]));
function strategyContext(){return analysis.context(state.nativeReport,state.runtime,state.selectedRunId)}
function nativeRun(){return strategyContext().run}
function displayMarket(){return state.marketSource==='run'?native.marketData(nativeRun()):state.data}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),4000)}
function setSymbol(symbol){state.symbol=symbol}
function screenContext(presentation='window',extra={}){return {state:{...state,data:state.desk==='market'?displayMarket():state.data},strategy:strategyContext(),nativeRun:nativeRun(),market:displayMarket(),
  storedMarket:state.data,marketSource:state.marketSource,staticHosting:false,presentation,chartBus,actions,...extra}}
function switchDesk(desk){state.desk=desk;state.page=screens.home(desk).id;render()}
function openTool(id,parameters={}){
  const screen=screens.get(id),params=typeof parameters==='string'?{symbol:parameters}:parameters||{};
  if(screen.kind==='workspace'){switchDesk(screen.desk);return}
  if(screen.kind==='dialog'){openDialog(id,params);return}
  state.desk=screen.desk;
  if(screen.panel===false){state.page=id;render();return}
  state.page=screens.home(screen.desk).id;render();desks[screen.desk].open(id,params);
}
function health(){
  const preview=document.documentElement.dataset.hosting==='pages';
  const ctx=strategyContext(),a=ctx.account,stale=a?.status==='running'&&Date.now()-Date.parse(a.updated_at)>15000;
  $('#connection-state').textContent=preview?'PUBLIC PREVIEW · ENGINE DISCONNECTED':state.loading?'LOADING ENGINE…':state.pollError?'API ERROR · last successful publication retained':state.marketError?'DATA ERROR · account query succeeded':stale?'STALE RUNNING SNAPSHOT':'ENGINE API · '+(a?.status||ctx.run?.summary.mode||'NO RUNS');
  $('#connection-state').className=state.pollError||state.marketError||stale?'negative':'connection';
  const source=state.desk==='admin'?'ADMINISTRATION / ACCESS POLICY & DATA OPERATIONS':state.desk==='market'?(state.marketSource==='run'?'RUN SOURCE BARS · '+(ctx.entry?.name||''):'CANONICAL SOURCE SAMPLE'):
    a?`${a.name} · ${a.status} · ACCOUNT / STRATEGY LEDGER`:ctx.entry?'STRATEGY / '+ctx.entry.name:'NO STORED RUN';
  $('#context-scope').textContent=source;
  $('#banner').textContent=preview?'PUBLIC UI PREVIEW / PUBLIC MARKET SNAPSHOT ONLY / PRIVATE ENGINE, ACCOUNTS AND SERVER OPERATIONS DISCONNECTED':state.pollError?'QUERY ERROR: '+state.pollError+' · DISPLAYING LAST SUCCESSFUL QUERY':state.marketError&&(state.desk==='analysis'||state.desk==='market')?'SOURCE QUERY ERROR / LAST SOURCE SNAPSHOT RETAINED: '+state.marketError:
    state.desk==='admin'?'ADMINISTRATOR POLICY / NO LIVE ORDER CONTROLS':state.desk==='market'?'INDEPENDENT SOURCE / SYMBOL PANES · STORED EVENTS OR HISTORICAL RUN BARS · NO LIVE QUOTE FEED'+(state.data.synthetic_sources_present?' · INCLUDES SYNTHETIC SOURCES':''):
    (a?.source?.synthetic||ctx.run?.source?.synthetic?'SYNTHETIC / PAPER · SYNTHETIC RESEARCH / ':'ENGINE REPORT · ')+
      (stale?'RUNNING PUBLICATION STALE / ':'')+'INTERNAL LEDGER / BROKER DISCONNECTED';
}
function render(){
  pageDispose();pageDispose=()=>{};
  const ctx=strategyContext();state.selectedRunId=ctx.entry?.id||null;
  if(state.marketSource==='run'&&!ctx.run)state.marketSource='stored';
  const market=displayMarket(),symbols=terminal.securities(market);
  if(!symbols.some(s=>s.symbol===state.symbol))state.symbol=symbols[0]?.symbol||'';
  const selected=$('#context-portfolio');selected.replaceChildren();
  const groups={account:document.createElement('optgroup'),run:document.createElement('optgroup')};
  groups.account.label='SHARED ACCOUNTS';groups.run.label='STANDALONE RESEARCH';
  for(const row of state.choices){const option=document.createElement('option');option.value=row.key;option.textContent=row.label;groups[row.kind].append(option)}
  for(const group of Object.values(groups))if(group.children.length)selected.append(group);
  if(!state.choices.length){const o=document.createElement('option');o.textContent='NO STORED ACCOUNTS OR RUNS';selected.append(o)}
  selected.value=state.selectedPortfolio||'';selected.disabled=!state.choices.length;
  $('#context-run').innerHTML=ctx.entries.map(e=>`<option value="${esc(e.id)}" ${e.id===state.selectedRunId?'selected':''}>${esc(e.name)} · ${esc(e.state||'STATE UNREPORTED')}</option>`).join('')||'<option>NO STRATEGY</option>';
  $('#context-run').disabled=!ctx.entries.length;
  $('#context-symbol').innerHTML=terminal.contextOptions(market,state.runtime,state.symbol,null).symbols;
  $('#context-symbol').disabled=!symbols.length;$('#market-source').value=state.marketSource;
  $('#market-source option[value="run"]').disabled=!ctx.run;
  $('#market-context').hidden=state.desk!=='market';$('#strategy-context').hidden=state.desk==='market'||state.desk==='admin';
  const current=screens.get(state.page);$('#crumb').textContent=current.title;$('#page-title').textContent=current.title;
  $('#page-subtitle').textContent=current.subtitle||'';
  $$('nav button').forEach(b=>b.classList.toggle('active',screens.get(b.dataset.page).desk===state.desk));
  const stamp=state.desk==='market'?market.as_of:ctx.account?.as_of||ctx.run?.curve.at(-1)?.timestamp;
  $('#asof').textContent=state.desk==='admin'?'ACCESS / DATABASE OPERATIONS':stamp?new Date(stamp).toLocaleString('en-GB',{timeZone:'Asia/Seoul',hour12:false})+' KST · CONTEXT AS OF':'NO SOURCE OBSERVATION';
  const root=$('#page');root.innerHTML=screens.render(state.page,screenContext('page'),pagePanes.get(state.page)||{});
  const pane=pagePanes.get(state.page)||{};pagePanes.set(state.page,pane);
  pageDispose=screens.mount(state.page,root,screenContext('page'),pane);
  health();
}
async function refresh(selection=state.selectedPortfolio){
  state.loading=true;health();
  try{
    const value=await client.load(selection);if(!value)return;
    const oldSelection=state.selectedPortfolio;
    const reportKey=value.report?.account?value.report.account.id+':'+value.report.account.updated_at:
      value.report?.runs[0]?.id||'empty';
    const version=reportKey+':'+(value.data?.version||'market-error')+':'+(value.marketError||'')+':'+JSON.stringify(value.choices);
    state.pollError=null;state.marketError=value.marketError;state.loading=false;
    if(lastVersion===version&&oldSelection===value.selected){health();return}
    state.choices=value.choices;state.selectedPortfolio=value.selected;state.nativeReport=value.report;if(value.data)state.data=value.data;
    if(oldSelection!==value.selected){state.selectedRunId=null;for(const desk of Object.values(desks))for(const p of desk.panes){delete p.chartStates;delete p.runId}}
    lastVersion=version;render();
    if(activeDialog)openDialog(activeDialog.id,activeDialog.params);
  }catch(error){if(error.name==='AbortError')return;state.loading=false;state.pollError=error.message;health();toast(error.message)}
}
async function openDialog(id,params){
  const request=++dialogRequest,screen=screens.get(id);
  try{
    const extra=screen.load?await screen.load(screenContext('dialog'),params):params;
    if(request!==dialogRequest)return;
    dialogDispose();const root=$('#detail-body'),ctx=screenContext('dialog',extra);
    root.innerHTML=screens.render(id,ctx,{});dialogDispose=screens.mount(id,root,ctx,{});
    activeDialog={id,params};if(!$('#detail').open)$('#detail').showModal();
  }catch(error){if(request===dialogRequest)toast(error.message)}
}
function closeDialog(){dialogRequest++;activeDialog=null;dialogDispose();dialogDispose=()=>{};$('#detail-body').replaceChildren();if($('#detail').open)$('#detail').close()}
const actions=Object.freeze({render,api,operation,setSymbol,openScreen:openTool,selectRun:async id=>{await refresh('run:'+id);openTool('backtest-results',{runId:id})},selectStrategy:id=>{state.selectedRunId=id;render()},
  inspectSymbol:symbol=>{state.marketSource=nativeRun()?'run':'stored';state.symbol=symbol;openTool('security',{symbol})},
  showEvent:id=>openDialog('event-detail',{eventId:id}),closeEvent:closeDialog,
  setFilter:(key,value)=>{if(['search','category','priority'].includes(key))state[key]=value},
  toggleWatch:id=>{state.watch=state.watch.includes(id)?state.watch.filter(v=>v!==id):[...state.watch,id];render()},
  updateWidgets:widgets=>{state.widgets=widgets;render()},
  mountWorkspace:root=>{const desk=desks[state.desk];desk.mount(root);return ()=>desk.dispose()}
});
$('nav').innerHTML=screens.navigation().map(s=>`<button data-page="${s.id}" title="${s.number} / ${s.command}">${esc(s.navLabel||s.title)}</button>`).join('');
$('nav').onclick=e=>{const b=e.target.closest('[data-page]');if(b)openTool(b.dataset.page)};
$('#context-portfolio').onchange=e=>refresh(e.target.value);
$('#context-run').onchange=e=>{state.selectedRunId=e.target.value;render()};
$('#context-symbol').onchange=e=>{state.symbol=e.target.value;render()};
$('#market-source').onchange=e=>{state.marketSource=e.target.value;state.symbol='';render()};
$('#refresh').onclick=()=>refresh();
$('#new-strategy').onclick=()=>openTool('strategy-lab');
$('#orders-shortcut').onclick=()=>openTool('order-monitor');
$('#command-form').onsubmit=e=>{
  e.preventDefault();const [command,...args]=$('#command').value.trim().split(/\s+/),upper=command.toUpperCase();
  if(upper==='HELP'){$('#help-dialog').showModal();return}
  if(upper==='REFRESH'){refresh();return}
  const s=screens.resolve(command);if(!s){$('#command-status').textContent='Enter a registered screen number or function.';return}
  try{
    if(s.id==='security'&&args.length&&!terminal.securities(displayMarket()).some(x=>x.symbol===args[0])&&nativeRun()?.market?.some(b=>b.symbol===args[0]))state.marketSource='run';
    const params=s.parseArgs?.(args,screenContext('page'))||{};openTool(s.id,params);
    $('#command-status').textContent=s.number+' / '+s.title;$('#command').value='';$('#command').blur();
  }catch(error){$('#command-status').textContent=error.message}
};
$('#help-dialog p').innerHTML=screens.list.map(s=>`${s.number} / ${esc(s.command)} — ${esc(s.title)}`).join('<br>');
$('#close-help').onclick=()=>$('#help-dialog').close();
$('#help').onclick=()=>$('#help-dialog').showModal();
$('#detail').addEventListener('cancel',closeDialog);
$('#detail').addEventListener('close',()=>{if(activeDialog)closeDialog()});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)||e.target.isContentEditable||document.querySelector('dialog[open]'))return;
  if(e.key==='/'){e.preventDefault();$('#command').focus()}
  if(/^[1-6]$/.test(e.key))switchDesk(deskIds[Number(e.key)-1]);
});
setInterval(()=>{
  health();if(!$('#auto-poll').checked||pollBusy||state.loading)return;
  pollBusy=true;refresh().finally(()=>{pollBusy=false});
},2000);
api('/api/health').then(h=>{state.role=h.role}).catch(()=>{});
render();refresh();
