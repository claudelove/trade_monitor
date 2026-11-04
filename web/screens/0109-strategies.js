import * as native from '../native-report.js';
import {strategyView} from '../runtime-ui.js';
import {bindActions,field,listen} from '../ui/dom.js';
export default {id:'strategies',number:'0109',command:'CODE',aliases:['STRAT'],desk:'backtest',defaultSlot:0,title:'전략 연결',subtitle:'외부 코드의 식별 정보와 보고 형식을 확인합니다.',nav:false,navOrder:10,navLabel:'CODE',render:ctx=>ctx.state.nativeReport?native.strategyView(ctx.nativeRun):strategyView(ctx.state.runtime),mount(root,ctx){const off=[bindActions(root,ctx.actions)],input=field(root,'runtime-file');if(input)off.push(listen(input,'change',async()=>{if(input.files[0])await ctx.actions.readReport(input.files[0])}));return ()=>off.forEach(f=>f())}};
