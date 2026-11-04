import {strategyView} from '../native-report.js';
export default {scope:'strategy',id:'strategies',number:'0303',legacyNumbers:['0109'],command:'CODE',aliases:['STRAT'],desk:'backtest',defaultSlot:1,title:'Strategy / Execution / Risk Manifest',subtitle:'Reviewed source identity and exact engine configuration.',render:ctx=>strategyView(ctx.nativeRun)};
