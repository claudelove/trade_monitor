import {bindFunctionSearch} from './shared/ui/function-search.js';
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
  watch:[],search:'',category:'all',priority:'all',pollError:null,marketError:null,loading:false,foregroundLoading:false,role:null};
const client=new EngineClient(),chartBus=new ChartLinkBus(),pagePanes=new Map();
let pageDispose=()=>{},dialogDispose=()=>{},dialogRequest=0,activeDialog=null,lastVersion=null,lastReportVersion=null,pollBusy=false,lastMountedDesk=null;
const deskIds=['strategy','market','backtest','analysis','execution','admin'];
const desks=Object.fromEntries(deskIds.map(profile=>[profile,new WindowWorkspace({profile,storage:localStorage,
  content:p=>{const s=screens.get(p.type),ctx=paneContext(screenContext('window'),p,s);return selectionBar(ctx,p,s)+screens.render(p.type,ctx,p)},
  bind:(root,p)=>{const ctx=paneContext(screenContext('window'),p,screens.get(p.type)),off=bindSelection(root,ctx,p),dispose=screens.mount(p.type,root,ctx,p);return ()=>{off();dispose()}}})]));
function strategyContext(){return analysis.context(state.nativeReport,state.runtime,state.selectedRunId)}
function nativeRun(){return strategyContext().run}
function displayMarket(){return state.marketSource==='run'?native.marketData(nativeRun()):state.data}
let toastTimer=null;
function toast(message){const box=$('#toast');if(!box)return;clearTimeout(toastTimer);box.textContent=message;box.classList.add('visible');toastTimer=setTimeout(()=>box.classList.remove('visible'),4000)}
function setSymbol(symbol){state.symbol=symbol}
function screenContext(presentation='window',extra={}){return {state:{...state,data:state.desk==='market'?displayMarket():state.data},strategy:strategyContext(),nativeRun:nativeRun(),market:displayMarket(),
  storedMarket:state.data,marketSource:state.marketSource,staticHosting:false,presentation,chartBus,actions,...extra}}
function switchDesk(desk){state.desk=desk;state.page=screens.home(desk).id;render()}
function openTool(id,parameters={}){
  const screen=screens.get(id),params=typeof parameters==='string'?{symbol:parameters}:parameters||{};
  if(screen.kind==='workspace'){switchDesk(screen.desk);return}
  if(screen.kind==='dialog'){openDialog(id,params);return}
  const sameWorkspace=state.desk===screen.desk&&state.page===screens.home(screen.desk).id&&desks[screen.desk].root?.isConnected;
  state.desk=screen.desk;
  if(screen.panel===false){state.page=id;render();return}
  state.page=screens.home(screen.desk).id;
  if(!sameWorkspace)render();
  desks[screen.desk].open(id,params);
}
function health(){
  const preview=document.documentElement.dataset.hosting==='pages';
  const ctx=strategyContext(),a=ctx.account,stale=a?.status==='running'&&Date.now()-Date.parse(a.updated_at)>15000;
  $('#connection-state').textContent=preview?'PUBLIC PREVIEW · ENGINE DISCONNECTED':state.loading&&state.foregroundLoading?'LOADING ENGINE…':state.pollError?'API ERROR · last successful publication retained':state.marketError?'DATA ERROR · account query succeeded':stale?'STALE RUNNING SNAPSHOT':'ENGINE API · '+(a?.status||ctx.run?.summary.mode||'NO RUNS');
  $('#connection-state').className=state.pollError||state.marketError||stale?'negative':state.loading&&state.foregroundLoading?'connection is-loading':'connection';
  const source=state.desk==='execution'?'KIS OPERATING CONTROL / SEPARATE RESEARCH HISTORY':state.desk==='admin'?'ADMINISTRATION / ACCESS POLICY & DATA OPERATIONS':state.desk==='market'?(state.marketSource==='run'?'RUN SOURCE BARS · '+(ctx.entry?.name||''):'CANONICAL SOURCE SAMPLE'):
    a?`${a.name} · ${a.status} · ACCOUNT / STRATEGY LEDGER`:ctx.entry?'STRATEGY / '+ctx.entry.name:'NO STORED RUN';
  $('#context-scope').textContent=source;
  $('#banner').textContent=preview?'PUBLIC UI PREVIEW / PUBLIC MARKET SNAPSHOT ONLY / PRIVATE ENGINE, ACCOUNTS AND SERVER OPERATIONS DISCONNECTED':state.pollError?'QUERY ERROR: '+state.pollError+' · DISPLAYING LAST SUCCESSFUL QUERY':state.marketError&&(state.desk==='analysis'||state.desk==='market')?'SOURCE QUERY ERROR / LAST SOURCE SNAPSHOT RETAINED: '+state.marketError:
    state.desk==='execution'?'KIS OPERATING CONTROL IN BROKER [0504] · RESEARCH HISTORY IN BLOTTER / FILLS · REAL DISPATCH DISABLED':state.desk==='admin'?'ADMINISTRATOR POLICY / NO LIVE ORDER CONTROLS':state.desk==='market'?'INDEPENDENT SOURCE / SYMBOL PANES · STORED EVENTS OR HISTORICAL RUN BARS · NO LIVE QUOTE FEED'+(state.data.synthetic_sources_present?' · INCLUDES SYNTHETIC SOURCES':''):
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
  if(!state.choices.length){const o=document.createElement('option');o.value='';o.textContent='NO STORED ACCOUNTS OR RUNS';selected.append(o)}
  selected.value=state.selectedPortfolio||'';selected.disabled=!state.choices.length;
  $('#context-run').innerHTML=ctx.entries.map(e=>`<option value="${esc(e.id)}" ${e.id===state.selectedRunId?'selected':''}>${esc(e.name)} · ${esc(e.state||'STATE UNREPORTED')}</option>`).join('')||'<option>NO STRATEGY</option>';
  $('#context-run').disabled=!ctx.entries.length;$('#context-run').hidden=!ctx.entries.length;$('label[for=context-run]').hidden=!ctx.entries.length;
  $('.terminal-context').hidden=['market','admin'].includes(state.desk)||!state.choices.length;
  const current=screens.get(state.page);$('#crumb').textContent=current.title;
  $$('nav button').forEach(b=>b.classList.toggle('active',screens.get(b.dataset.page).desk===state.desk));
  const stamp=state.desk==='market'?market.as_of:ctx.account?.as_of||ctx.run?.curve.at(-1)?.timestamp;
  $('#asof').textContent=state.desk==='execution'?'BROKER CLOCKS SHOWN PER FUNCTION':state.desk==='admin'?'ACCESS / DATABASE OPERATIONS':stamp?new Date(stamp).toLocaleString('en-GB',{timeZone:'Asia/Seoul',hour12:false})+' KST · CONTEXT AS OF':'NO SOURCE OBSERVATION';
  const root=$('#page');root.innerHTML=screens.render(state.page,screenContext('page'),pagePanes.get(state.page)||{});
  const pane=pagePanes.get(state.page)||{};pagePanes.set(state.page,pane);
  pageDispose=screens.mount(state.page,root,screenContext('page'),pane);
  health();
}
async function refresh(selection=state.selectedPortfolio,foreground=true){
  state.foregroundLoading=foreground;state.loading=true;health();
  try{
    const value=await client.load(selection);if(!value)return;
    const oldSelection=state.selectedPortfolio;
    const reportKey=value.report?.account?value.report.account.id+':'+value.report.account.updated_at:
      value.report?.runs[0]?.id||'empty';
    const reportVersion=reportKey+':'+JSON.stringify(value.choices);
    const version=reportVersion+':'+(value.data?.version||'market-error')+':'+(value.marketError||'');
    state.pollError=null;state.marketError=value.marketError;state.loading=false;
    if(lastVersion===version&&oldSelection===value.selected){health();return}
    state.choices=value.choices;state.selectedPortfolio=value.selected;state.nativeReport=value.report;if(value.data)state.data=value.data;
    if(oldSelection!==value.selected){state.selectedRunId=null;for(const desk of Object.values(desks))for(const p of desk.panes){delete p.chartStates;delete p.runId}}
    // Management panes own their API state. Market-only publication changes
    // must not destroy unsaved code, operating settings, focus or review.
    const retainManagement=lastReportVersion===reportVersion&&oldSelection===value.selected&&['backtest','execution','admin'].includes(state.desk)&&screens.get(state.page).kind==='workspace'&&desks[state.desk].root?.isConnected;
    lastVersion=version;lastReportVersion=reportVersion;
    if(retainManagement){health();return}
    render();
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
  mountWorkspace:root=>{const desk=desks[state.desk];desk.mount(root);if(lastMountedDesk!==state.desk)root.classList.add('workspace-reveal');lastMountedDesk=state.desk;return ()=>desk.dispose()}
});
$('nav').innerHTML=screens.navigation().map(s=>`<button data-page="${s.id}" title="${s.number} / ${s.command}">${esc(s.navLabel||s.title)}</button>`).join('');
$('nav').onclick=e=>{const b=e.target.closest('[data-page]');if(b)openTool(b.dataset.page)};
$('#context-portfolio').onchange=e=>refresh(e.target.value);
$('#context-run').onchange=e=>{state.selectedRunId=e.target.value;render()};
$('#refresh').onclick=()=>refresh();
const functionSearch=bindFunctionSearch($('#command-form'),{
  entries:()=>screens.list.filter(s=>s.kind==='screen').map(s=>({id:s.id,number:s.number,command:s.command,title:s.title,group:screens.home(s.desk).navLabel||s.desk,aliases:[...(s.aliases||[]),...(s.legacyNumbers||[])]})),
  onSubmit:(text,selection,{selected})=>{
    const [command='',...args]=text.split(/\s+/),upper=command.toUpperCase();
    if(!selected&&upper==='HELP'){functionSearch.open(true);return false}
    if(!selected&&upper==='REFRESH'){refresh();$('#command-status').textContent='REFRESH REQUESTED';$('#command-status').removeAttribute('title');return true}
    const direct=selected?null:screens.resolve(command),s=selected?selection&&screens.get(selection.id):direct||selection&&screens.get(selection.id);
    if(!s)throw Error('No matching function. Enter a screen number, command or name.');
    if(s.id==='security'&&direct&&args.length){
      const symbol=args.join(' ').toUpperCase();
      const source=[...new Set([state.marketSource,'stored','run'])].find(source=>terminal.securities(source==='stored'?state.data:native.marketData(nativeRun())).some(item=>item.symbol===symbol));
      if(source&&source!==state.marketSource){state.marketSource=source;if(state.desk==='market')render()}
    }
    const params=direct?s.parseArgs?.(args,screenContext('page'))||{}:{};
    if(direct&&s.id==='security'&&args.length)params.marketSource=state.marketSource;
    openTool(s.id,params);$('#command-status').textContent=s.number+' / '+s.command;$('#command-status').removeAttribute('title');return true;
  },
  onError:message=>{$('#command-status').textContent=message;$('#command-status').title=message;toast(message)}
});
$('#detail').addEventListener('cancel',closeDialog);
$('#detail').addEventListener('close',()=>{if(activeDialog)closeDialog()});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)||e.target.isContentEditable||document.querySelector('dialog[open]'))return;
  if(e.key==='/'){e.preventDefault();functionSearch.open()}
  if(/^[1-6]$/.test(e.key))switchDesk(deskIds[Number(e.key)-1]);
});
setInterval(()=>{
  health();if(!$('#auto-poll').checked||pollBusy||state.loading)return;
  pollBusy=true;refresh(undefined,false).finally(()=>{pollBusy=false});
},2000);
api('/api/health').then(h=>{state.role=h.role}).catch(()=>{});
render();refresh();
