import * as native from '../native-report.js';
import {accountView} from '../terminal-ui.js';
import {chartSlot,mountCharts} from '../charts/host.js';
export default {id:'account',number:'0110',command:'ACC',desk:'strategy',title:'계좌 장부',subtitle:'엔진이 보고한 계좌 장부를 조회합니다.',nav:true,navOrder:11,navLabel:'ACCOUNT',render:ctx=>ctx.state.nativeReport?chartSlot('account')+native.accountView(ctx.state.nativeReport.account):accountView(),mount(root,ctx,pane){const account=ctx.strategy.account;if(!account)return ()=>{};return mountCharts(root,ctx,pane,[{role:'account',key:'account:'+account.id,linkGroup:'account:'+account.id,title:'계좌 NAV / KRW',series:[{id:'nav',label:'계좌 NAV',type:'line',unit:'KRW',color:'#f5d34e',data:account.curve.map(p=>({timestamp:p.timestamp,value:p.equity}))}]}])}};
