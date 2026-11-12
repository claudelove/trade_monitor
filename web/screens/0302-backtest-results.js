import performance from '../views/performance.js';
import {esc,listen} from '../ui/dom.js';
export default {...performance,id:'backtest-results',number:'0302',command:'BTRESULT',desk:'backtest',title:'Research Results',subtitle:'Review the stored run and its declared execution mode.',nav:false,shortcut:null,defaultSlot:3,
 render(ctx,pane){const run=ctx.strategy.run;return performance.render(ctx,pane)+(run?.code_version?`<section class="execution-handoff"><b>RESEARCH → EXECUTION REVIEW</b><p>Review this exact saved source in BROKER. Account capital, risk, restart support and actual broker readiness are checked separately. A backtest never starts trading.</p><code>${esc(run.code_version)}</code><button data-result-execution>REVIEW EXECUTION [0504]</button></section>`:'')},
 mount(root,ctx,pane){const dispose=performance.mount(root,ctx,pane);const off=listen(root,'click',event=>{if(event.target.closest('[data-result-execution]')){const run=ctx.strategy.run;if(run?.code_version)ctx.actions.openScreen('broker',{reviewVersion:run.code_version,researchRun:run.id})}});return()=>{off();dispose()}}
};
