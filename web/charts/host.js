import {TerminalChart} from './terminal-chart.js';
export const chartSlot=(role='main')=>`<div class="chart-slot" data-chart-slot="${role}"></div>`;
export function mountCharts(root,context,pane,specifications){const charts=[];try{for(const spec of specifications){const slot=root.querySelector(`[data-chart-slot="${spec.role||'main'}"]`);if(!slot)continue;pane.chartStates??=Object.create(null);const role=spec.stateRole||spec.role||'main';if(!Object.hasOwn(pane.chartStates,role))pane.chartStates[role]={};charts.push(new TerminalChart(slot,{...spec,bus:context.chartBus,state:pane.chartStates[role]}))}}catch(error){charts.forEach(chart=>chart.dispose());throw error}return ()=>charts.forEach(chart=>chart.dispose())}
export function strategyGroup(ctx){return 'strategy:'+String(ctx.account?.id||'standalone')+':'+String(ctx.entry?.id||'none')}
export function marketGroup(ctx,symbol){if(ctx.marketSource==='public')return 'market:public:'+ctx.state.mode+':'+symbol;return 'market:'+ctx.marketSource+':'+String(ctx.strategy.account?.id||'public')+':'+String(ctx.strategy.entry?.id||'none')+':'+symbol}

export function marketLinkGroup(ctx){return ctx.marketSource==='public'?'market-link:public:'+ctx.state.mode:'market-link:run:'+String(ctx.strategy.account?.id||'standalone')+':'+String(ctx.strategy.entry?.id||'none')}
