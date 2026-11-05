// Pane selections are memory-only. Shared account publications remain atomic.
import {context} from './strategy-analysis.js';
import {marketData} from './native-report.js';
import {securities} from './terminal-ui.js';
import {esc,listen} from './ui/dom.js';

export function paneContext(base,pane,screen){
  const entries=base.strategy.entries;
  const scoped=screen.scope==='strategy'||screen.desk==='market';
  if(scoped&&!pane.followSelection&&entries.length&&!entries.some(e=>e.id===pane.runId))pane.runId=base.strategy.entry?.id;
  const strategy=scoped?context(base.state.nativeReport,base.state.runtime,pane.followSelection?base.strategy.entry?.id:pane.runId):base.strategy;
  if(screen.desk==='market'){
    pane.marketSource??=screen.id==='security'?base.marketSource:'stored';
    const market=pane.marketSource==='run'?marketData(strategy.run):base.storedMarket;
    const symbols=securities(market);
    if(!symbols.some(s=>s.symbol===pane.symbol))pane.symbol=symbols.find(s=>s.symbol===base.state.symbol)?.symbol||symbols[0]?.symbol||'';
    return {...base,strategy,nativeRun:strategy.run,market,marketSource:pane.marketSource,
      state:{...base.state,data:market,symbol:pane.symbol,search:pane.search||'',category:pane.category||'all',priority:pane.priority||'all'},
      actions:{...base.actions,setFilter:(key,value)=>{if(['search','category','priority'].includes(key))pane[key]=value}}};
  }
  return {...base,strategy,nativeRun:strategy.run,
    actions:{...base.actions,inspectSymbol:symbol=>base.actions.openScreen('security',{symbol,marketSource:'run',runId:strategy.entry?.id})}};
}
export function selectionBar(ctx,pane,screen){
  if(screen.scope!=='strategy'&&!(screen.id==='security'&&ctx.marketSource==='run'))return '';
  return `<div class="pane-selection"><span class="field-label">STRATEGY</span><select data-pane-run aria-label="Panel strategy">${ctx.strategy.entries.map(e=>`<option value="${esc(e.id)}" ${e.id===ctx.strategy.entry?.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select><label title="Follow the new-pane strategy selector"><input type="checkbox" data-pane-follow ${pane.followSelection?'checked':''}>FOLLOW</label></div>`;
}
export function bindSelection(root,ctx,pane){
  return listen(root,'change',event=>{
    if(event.target.matches('[data-pane-run]')){pane.runId=event.target.value;pane.followSelection=false;ctx.actions.render()}
    if(event.target.matches('[data-pane-follow]')){pane.runId=ctx.strategy.entry?.id;pane.followSelection=event.target.checked;ctx.actions.render()}
  });
}
