import * as native from '../native-report.js';
import {strategyView} from '../runtime-ui.js';
import {bindActions} from '../ui/dom.js';
export default {id:'strategies',number:'0109',command:'CODE',aliases:['STRAT'],desk:'backtest',defaultSlot:0,title:'전략 연결',subtitle:'외부 코드의 식별 정보와 보고 형식을 확인합니다.',nav:false,navOrder:10,navLabel:'CODE',render:ctx=>ctx.state.nativeReport?native.strategyView(ctx.nativeRun):strategyView(ctx.state.runtime),mount:(root,ctx)=>bindActions(root,ctx.actions)};
