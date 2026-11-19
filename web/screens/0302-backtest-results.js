import {executionView} from '../views/research-costs.js';
import performance from '../views/performance.js';

export default {...performance,id:'backtest-results',number:'0302',command:'BTRESULT',desk:'backtest',title:'Backtest Results',subtitle:'Review the stored run and its declared execution mode.',nav:false,shortcut:3,defaultSlot:null,legacyNumbers:['0101','0104'],legacyIds:['performance','execution'],aliases:['PERF','EXEC'],
 render(ctx,pane){const run=ctx.strategy.run;return performance.render(ctx,pane)+(run?'<details><summary>SIMULATED EXECUTION / COSTS</summary>'+executionView(ctx.strategy)+'</details>':'')},
 mount:performance.mount
};
