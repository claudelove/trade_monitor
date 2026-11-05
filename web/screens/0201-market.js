import {marketTable,marketView} from '../terminal-ui.js';
import {marketCoverage} from '../views/event-monitor.js';
import {bindActions} from '../ui/dom.js';
export default {id:'market',number:'0201',command:'QUOTE',desk:'market',title:'Security Monitor',subtitle:'Stored security sample, not a market-wide ranking.',defaultSlot:0,render:ctx=>marketCoverage(ctx.market)+(ctx.presentation==='page'?marketView(ctx.market,ctx.state.symbol):'<div class="section-note">Stored sample / change from the last two source bars</div>'+marketTable(ctx.market,ctx.state.symbol)),mount:(root,ctx)=>bindActions(root,ctx.actions)};

