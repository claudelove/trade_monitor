import {watchView} from '../market-ui.js';
import {mountFilings} from './0204-monitor.js';
export default {id:'watchlist',number:'0206',command:'SAVED',desk:'market',title:'저장 공시',subtitle:'저장한 공시를 확인합니다.',panel:false,nav:true,navOrder:15,navLabel:'SAVED',badge:{id:'watch-count',value:ctx=>ctx.state.watch.length},render:watchView,mount:(root,ctx,pane)=>mountFilings(root,ctx,pane,true)};
