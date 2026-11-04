import * as native from '../native-report.js';
import {runsView} from '../runtime-ui.js';
import {bindActions,field,listen} from '../ui/dom.js';
export default {id:'runs',number:'0108',command:'ORD',desk:'strategy',title:'실행 원장',subtitle:'원본 주문·체결·판단·평가 이력을 조회합니다.',render:ctx=>ctx.state.nativeReport?native.runView(ctx.nativeRun):runsView(ctx.state.runtime,ctx.state.selectedRunId),mount(root,ctx){const off=[bindActions(root,ctx.actions)],select=field(root,'runtime-run');if(select)off.push(listen(select,'change',()=>ctx.actions.selectStrategy(select.value)));return ()=>off.forEach(f=>f())}};
