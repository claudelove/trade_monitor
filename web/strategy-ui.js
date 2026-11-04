import {performanceView} from './screens/0101-performance.js';
import {holdingsView} from './screens/0102-holdings.js';
import {riskView} from './screens/0103-risk.js';
import {executionView} from './screens/0104-execution.js';
import {attributionView} from './screens/0105-attribution.js';
import {correlationView} from './screens/0106-correlation.js';
import {diagnosticsView} from './screens/0107-diagnostics.js';
export {performanceView} from './screens/0101-performance.js';
export {holdingsView} from './screens/0102-holdings.js';
export {riskView} from './screens/0103-risk.js';
export {executionView} from './screens/0104-execution.js';
export {attributionView} from './screens/0105-attribution.js';
export {correlationView} from './screens/0106-correlation.js';
export {diagnosticsView} from './screens/0107-diagnostics.js';
export function view(type,ctx,pane={}){const map={performance:()=>performanceView(ctx,pane.metric),holdings:()=>holdingsView(ctx),risk:()=>riskView(ctx),attribution:()=>attributionView(ctx),execution:()=>executionView(ctx),correlation:()=>correlationView(ctx),diagnostics:()=>diagnosticsView(ctx)};return map[type]?.()||''}
