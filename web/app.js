import {screens} from './screens.js';
import {ChartLinkBus} from './charts/model.js';
import * as strategyAnalysis from './strategy-analysis.js';
import {analysisExample} from './analysis-example.js';
import {WindowWorkspace} from './window-workspace.js';
import * as nativeUI from './native-report.js';
import * as terminal from './terminal-ui.js';
import {validateBundle} from './runtime-contract.js';
const STATIC_HOSTING=document.documentElement.dataset.hosting==='pages';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const write=(key,v)=>{try{localStorage.setItem(key,JSON.stringify(v))}catch{}};
let state={mode:'live',page:'overview',desk:'strategy',marketSource:'public',portfolios:[],selectedPortfolioId:null,symbol:'005930',priceRange:'60',newsSearch:'',data:null,search:'',category:'all',priority:'all',watch:read('catalyst-watch',[]),widgets:read('catalyst-widgets',[{id:'stats',show:true},{id:'events',show:true},{id:'context',show:true}]),runtime:{strategies:[],runs:[],transport:'unconnected'},runtimeImported:false,runtimeContract:null,selectedRunId:null,nativeReport:null};
const chartBus=new ChartLinkBus();
let pageDispose=()=>{},dialogDispose=()=>{},configurationDispose=()=>{},dialogRequest=0;
const pagePanes=new Map();
const desks=Object.fromEntries(['strategy','market','backtest','analysis'].map(profile=>[profile,new WindowWorkspace({profile,storage:localStorage,content:paneContent,bind:bindPane,symbols:()=>terminal.securities(displayMarket()),onImport:()=>$('#result-file').click(),onClear:closeReport,onExample:showAnalysisExample})]));
let desktop=desks.strategy;
function nativeRun(){return state.nativeReport?.runs.find(r=>r.id===state.selectedRunId)||(!state.selectedRunId?state.nativeReport?.runs[0]:null)||null}
function strategyContext(){return strategyAnalysis.context(state.nativeReport,state.runtime,state.selectedRunId)}
function displayMarket(){return state.marketSource==='run'?nativeUI.marketData(nativeRun()):state.data}
function switchDesk(profile){state.desk=profile;state.page=screens.home(profile).id;render()}
function openTool(id,parameters=null){const screen=screens.get(id);if(screen.kind==='workspace'){switchDesk(screen.desk);return}if(screen.kind==='dialog'){openDialog(screen.id,parameters||{});return}state.desk=screen.desk;if(screen.panel===false){selectPage(screen.id);return}state.page=screens.home(screen.desk).id;render();desktop.open(screen.id,parameters)}
async function closeReport(){state.nativeReport=null;state.portfolios=[];state.selectedPortfolioId=null;state.marketSource='public';state.runtimeImported=false;state.selectedRunId=null;state.runtime={strategies:[],runs:[],transport:'unconnected'};for(const desk of Object.values(desks))for(const pane of desk.panes){delete pane.chartStates;delete pane.symbol}pagePanes.clear();closeDialog();render();try{await load()}catch(error){toast(error.message)}}
function acceptNative(value){const report=nativeUI.parseNativeReport(value),id=(report.account?'account:':'run:')+(report.account?.id||report.runs[0].id);const previous=state.portfolios.findIndex(p=>p.id===id),record={id,report};if(previous>=0)state.portfolios[previous]=record;else state.portfolios.push(record);state.nativeReport=report;state.selectedPortfolioId=id;state.selectedRunId=null;state.runtimeImported=true;state.desk=state.desk==='backtest'?'backtest':'strategy';state.page=screens.home(state.desk).id}
function showAnalysisExample(){acceptNative(analysisExample());render();toast('합성 분석 예시입니다. 실제 전략/백테스트 성과가 아닙니다.')}

function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
async function api(path,body){if(STATIC_HOSTING)return (await import('./static-api.js')).api(path,body);const response=await fetch(path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});if(!response.ok){let detail;try{detail=(await response.json()).detail}catch{}throw Error(typeof detail==='string'?detail:`요청 실패 (${response.status})`)}return response.json()}
let loadSequence=0;
async function load(){const sequence=++loadSequence,mode=state.mode;const [data,runtime,contract]=await Promise.all([api('/api/snapshot?mode='+mode),state.runtimeImported?Promise.resolve(state.runtime):api('/api/runtime/state').catch(()=>({strategies:[],runs:[],transport:'unconnected'})),api('/api/runtime/contract').catch(()=>null)]);if(sequence!==loadSequence)return;state.data=data;if(!state.runtimeImported)state.runtime=runtime;state.runtimeContract=contract;render()}

function selectPage(page){const screen=screens.get(page);state.desk=screen.desk;state.page=page;render();window.scrollTo({top:0,behavior:'smooth'})}
function render(){
 pageDispose();configurationDispose();configurationDispose=()=>{};$('#layout-controls').hidden=true;
 const ctx=strategyContext();state.selectedRunId=ctx.entry?.id||null;desktop=desks[state.desk];
 if(state.marketSource==='run'&&!nativeRun())state.marketSource='public';
 const market=displayMarket(),symbols=terminal.securities(market);if(!symbols.some(s=>s.symbol===state.symbol))state.symbol=symbols[0]?.symbol||'';
 $('#context-symbol').innerHTML=terminal.contextOptions(market,state.runtime,state.symbol,state.selectedRunId).symbols;$('#context-symbol').disabled=!symbols.length;
 $('#context-run').innerHTML=ctx.entries.map(e=>`<option value="${esc(e.id)}" ${e.id===state.selectedRunId?'selected':''}>${esc(e.name)} · ${esc(e.state||'상태 미보고')}</option>`).join('')||'<option value="">전략 미연결</option>';$('#context-run').disabled=!ctx.entries.length;
 $('#context-portfolio').innerHTML=state.portfolios.map(p=>`<option value="${esc(p.id)}" ${p.id===state.selectedPortfolioId?'selected':''}>${esc(p.report.account?.name||p.report.runs[0]?.summary.strategy||'개별 실행')} · ${p.report.account?'계좌 실행':'단일 전략'}</option>`).join('')||'<option value="">독립 관측 / 포트폴리오 미연결</option>';$('#context-portfolio').disabled=state.portfolios.length<2;
 $('#mode').hidden=state.desk!=='market';$('#refresh-button').textContent=state.desk!=='market'?'결과 파일 열기':(STATIC_HOSTING?'↗ Actions에서 시장 갱신':'시장 데이터 수집');
 $('#market-context').hidden=state.desk!=='market';$('#strategy-context').hidden=state.desk==='market';$('#market-source').value=state.marketSource;$('#market-source option[value="run"]').disabled=!nativeRun();
 $('#context-scope').textContent=state.desk==='market'?(state.marketSource==='run'?'선택 전략의 저장 봉 · '+(ctx.entry?.name||''):'공개 시장 스냅샷 · 종목 표본'):(ctx.account?ctx.account.status+' · 계좌/전략 장부':ctx.entry?'선택 전략 단위':'포트폴리오·전략 결과를 연결하세요');
 const current=screens.get(state.page),title=current.title,subtitle=current.subtitle||'';
 $('#page-title').textContent=title;$('#page-subtitle').textContent=subtitle;$('#crumb').textContent=title;$$('nav button').forEach(b=>b.classList.toggle('active',screens.get(b.dataset.page).desk===state.desk));for(const screen of screens.navigation())if(screen.badge){const badge=$('#'+screen.badge.id);if(badge)badge.textContent=screen.badge.value(screenContext('nav'))}$('#layout-button').hidden=!current.configure;
 const asof=state.desk!=='market'?(ctx.run?.curve.at(-1)?.timestamp||ctx.legacy?.as_of||ctx.account?.as_of):market.as_of;$('#asof').textContent=asof?new Date(asof).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})+' KST 데이터 기준':'전략 데이터 미연결';
 $('#banner').className='banner '+(state.mode==='live'?'live':'');$('#banner').textContent=state.desk!=='market'?(state.nativeReport?.account?.source?.synthetic||nativeRun()?.source?.synthetic?'SYNTHETIC ANALYSIS / 합성 모니터링 예시 · 실제 전략·백테스트 성과가 아닙니다.':state.nativeReport?'ENGINE REPORT / 엔진 원본 결과 · 탭 메모리 조회 · 실시간 API/브로커 미연결':'STRATEGY MONITOR / 전략 결과를 연결하세요. 시장 스냅샷으로 전략 성과를 만들지 않습니다.'):(state.marketSource==='run'?'ENGINE MARKET / 선택 전략에 저장된 봉 · 현재 시장 시세와 구분':state.mode==='demo'?'SYNTHETIC DATA / 공시·가격 모두 합성한 기능 검증용 데모입니다.':STATIC_HOSTING?'GITHUB PAGES / 공개 수집 스냅샷 · 실시간 시세 아님':'LIVE SNAPSHOT / DART·뉴스·pykrx 수집 스냅샷 · 수정 일봉');
 const context=screenContext('page');const pane=pagePanes.get(state.page)||{};pagePanes.set(state.page,pane);$('#page').innerHTML=screens.render(state.page,context,pane);pageDispose=screens.mount(state.page,$('#page'),context,pane);
}

function download(name,rows,columns){const cell=v=>'"'+String(v??'').replace(/^[=+\-@]/,"'$&").replace(/"/g,'""')+'"';const csv='\ufeff'+[columns.map(cell).join(','),...rows.map(r=>columns.map(k=>cell(r[k])).join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`catalyst-${state.mode}-${name}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function changeMode(mode){state.mode=mode;try{await load()}catch(err){toast(err.message)}}
$('nav').innerHTML=screens.navigation().map(screen=>`<button data-page="${screen.id}" title="${screen.number} / ${screen.command}">${esc(screen.navLabel||screen.command)}${screen.badge?` <i id="${esc(screen.badge.id)}">0</i>`:''}</button>`).join('');
$('nav').onclick=event=>{const button=event.target.closest('[data-page]');if(button)openTool(button.dataset.page)};$('#mode').onchange=e=>changeMode(e.target.value);
$('#refresh-button').onclick=async()=>{if(state.desk!=='market'){$('#result-file').click();return}if(STATIC_HOSTING){window.open('https://github.com/claudelove/trade_monitor/actions/workflows/collect-live.yml','_blank','noopener');return}const end=new Date(),start=new Date(end);start.setUTCDate(start.getUTCDate()-30);$('#refresh-form [name=start]').value=start.toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});$('#refresh-form [name=end]').value=end.toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});$('#refresh-dialog').showModal()};$('.close-refresh').onclick=()=>$('#refresh-dialog').close();$('#refresh-form').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.tickers=data.tickers.split(',').map(s=>s.trim()).filter(Boolean);$('#collect-submit').disabled=true;$('#collect-result').textContent='수집 중… 공급자별 상태를 확인하고 있습니다.';try{const result=await api('/api/refresh',data);$('#collect-result').textContent=result.sources.map(s=>s.name+': '+s.detail).join(' / ');state.mode='live';$('#mode').value='live';await load();toast('수집 결과를 반영했습니다. 데이터 연결에서 상태를 확인하세요.')}catch(err){$('#collect-result').textContent=err.message}finally{$('#collect-submit').disabled=false}};
$('#layout-button').onclick=()=>{const box=$('#layout-controls'),screen=screens.get(state.page);box.hidden=!box.hidden;configurationDispose();configurationDispose=box.hidden?()=>{}:screen.configure?.(box,screenContext('page'))||(()=>{})};
if(STATIC_HOSTING){$('#refresh-button').textContent='↗ Actions에서 갱신';$('footer span:last-child').textContent='GitHub Pages · 공개 스냅샷 · 외부 전략 모니터'}
load().catch(err=>{$('#page').innerHTML='<div class="panel empty"><strong>서버에 연결할 수 없습니다</strong>Python API 서버 실행 상태를 확인한 후 새로고침하세요.</div>';toast(err.message)});

async function openRuntimeFile(file){
 if(file.size>5*1024*1024)throw Error('파일은 5MB 이하여야 합니다.');
 const value=JSON.parse(await file.text());if(value&&typeof value.id==='string'&&value.summary){acceptNative(value)}else{if(!state.runtimeContract)throw Error('이전 관측 규격을 읽지 못했습니다. 새로고침 후 다시 시도하세요.');const runtime=validateBundle(value,state.runtimeContract);state.runtime=runtime;state.nativeReport=null;state.portfolios=[];state.selectedPortfolioId=null;}
 state.runtimeImported=true;state.selectedRunId=null;state.desk=state.desk==='backtest'?'backtest':'strategy';state.page=screens.home(state.desk).id;render();toast('현재 탭에서만 파일을 열었습니다. 서버에 전송하지 않았습니다.');
}
$('#context-symbol').onchange=event=>{state.symbol=event.target.value;render()};
$('#context-run').onchange=event=>{state.selectedRunId=event.target.value;render()};
$('#context-portfolio').onchange=event=>{const portfolio=state.portfolios.find(p=>p.id===event.target.value);if(portfolio){state.nativeReport=portfolio.report;state.selectedPortfolioId=portfolio.id;state.selectedRunId=null;render()}};
$('#market-source').onchange=event=>{state.marketSource=event.target.value;render()};
$('#command-form').onsubmit=async event=>{
 event.preventDefault();const [command,...args]=$('#command').value.trim().split(/\s+/),upper=command.toUpperCase();
 if(upper==='HELP'){$('#help-dialog').showModal();return}
 if(upper==='REFRESH'){try{await load();$('#command-status').textContent='저장된 상태를 다시 조회했습니다.'}catch(error){toast(error.message)}return}
 const screen=screens.resolve(command);if(!screen){$('#command-status').textContent='알 수 없는 명령입니다. HELP를 확인하세요.';return}
 try{const parameters=screen.parseArgs?.(args,screenContext('page'))||null;openTool(screen.id,parameters);$('#command-status').textContent=screen.number+' / '+screen.title;$('#command').value='';$('#command').blur()}catch(error){$('#command-status').textContent=error.message}
};
$('#help-dialog p').innerHTML=screens.list.filter(s=>s.kind!=='dialog').map(s=>`${s.number} / ${esc(s.command)} — ${esc(s.title)}`).join('<br>');
$('#close-help').onclick=()=>$('#help-dialog').close();
document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(event.target.tagName)||event.target.isContentEditable||document.querySelector('dialog[open]'))return;if(event.key==='/'){event.preventDefault();$('#command').focus()}else if(/^[1-4]$/.test(event.key))switchDesk(['strategy','market','backtest','analysis'][Number(event.key)-1])});

function screenContext(presentation='window',extra={}){return {state:{...state},strategy:strategyContext(),nativeRun:nativeRun(),market:displayMarket(),marketSource:state.marketSource,staticHosting:STATIC_HOSTING,presentation,chartBus,actions,...extra}}
function paneContent(pane){return screens.render(pane.type,screenContext('window'),pane)}
function bindPane(root,pane){return screens.mount(pane.type,root,screenContext('window'),pane)}
$('#result-file').onchange=async event=>{const file=event.target.files[0];if(file){try{await openRuntimeFile(file)}catch(error){toast(error.message)}event.target.value=''}};

async function downloadRuntimeExample(){try{const value=await api('/api/runtime/example');const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='strategy-report.example.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(error){toast(error.message)}
}


async function openDialog(id,parameters={}){const request=++dialogRequest,screen=screens.get(id);try{const context=screenContext('dialog'),extra=screen.load?await screen.load(context,parameters):parameters;if(request!==dialogRequest)return;dialogDispose();const root=$('#detail-body'),ctx=screenContext('dialog',extra);root.innerHTML=screens.render(id,ctx,{});dialogDispose=screens.mount(id,root,ctx,{});if(!$('#detail').open)$('#detail').showModal()}catch(error){if(request===dialogRequest)toast(error.message)}}
function closeDialog(){dialogRequest++;dialogDispose();dialogDispose=()=>{};$('#detail-body').replaceChildren();if($('#detail').open)$('#detail').close()}
$('#detail').addEventListener('cancel',()=>closeDialog());$('#detail').addEventListener('close',()=>{if($('#detail').open)return;dialogDispose();dialogDispose=()=>{};dialogRequest++});
const actions=Object.freeze({
 render,api,refreshReport:async()=>{try{await load();toast(state.runtimeImported?'열어 둔 파일을 유지했습니다. 새 결과는 파일 열기로 교체하세요.':'관측 상태를 조회했습니다.')}catch(error){toast(error.message)}},setSymbol:symbol=>{state.symbol=symbol},openScreen:openTool,openReport:()=>$('#result-file').click(),showExample:showAnalysisExample,closeReport,readReport:async file=>{try{await openRuntimeFile(file)}catch(error){toast(error.message)}},downloadExample:downloadRuntimeExample,
 selectStrategy:id=>{state.selectedRunId=id;render()},inspectSymbol:symbol=>{state.marketSource=nativeRun()?'run':'public';state.symbol=symbol;openTool('security',{symbol})},
 showEvent:id=>openDialog('event-detail',{eventId:id}),closeEvent:closeDialog,
 fetchEventNews:async id=>{try{const result=await api('/api/event/'+encodeURIComponent(id)+'/news',{});state.data=await api('/api/snapshot?mode=live');render();await openDialog('event-detail',{eventId:id});toast('뉴스 검색 후보 '+result.items.length+'건을 반영했습니다.')}catch(error){toast(error.message)}},
 setFilter:(key,value)=>{if(['search','category','priority'].includes(key))state[key]=value},
 toggleWatch:id=>{state.watch=state.watch.includes(id)?state.watch.filter(value=>value!==id):[...state.watch,id];write('catalyst-watch',state.watch);render()},
 exportEvents:rows=>download('events',rows,['id','company','ticker','title','date','event_type','source']),changeMode,
 updateWidgets:widgets=>{state.widgets=widgets;write('catalyst-widgets',widgets);render()},
 mountWorkspace:root=>{const desk=desks[state.desk];desk.mount(root);return ()=>desk.dispose()}
});
