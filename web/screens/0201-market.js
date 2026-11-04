import {marketTable,marketView} from '../terminal-ui.js';
import {bindActions} from '../ui/dom.js';
export default {id:'market',number:'0201',command:'QUOTE',desk:'market',title:'종목 모니터',subtitle:'수집된 종목 표본이며 전체 시장 순위가 아닙니다.',defaultSlot:0,render:ctx=>ctx.presentation==='page'?marketView(ctx.market,ctx.state.symbol):'<div class="section-note">선택 표본 · 최근 2개 저장 일봉 대비</div>'+marketTable(ctx.market,ctx.state.symbol),mount:(root,ctx)=>bindActions(root,ctx.actions)};
