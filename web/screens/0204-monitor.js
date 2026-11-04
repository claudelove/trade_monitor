import {eventPanel,filteredEvents,tableRows} from '../market-ui.js';
import {bindActions,field,listen} from '../ui/dom.js';
export function mountFilings(root,ctx,pane,watch=false){const state=ctx.state,filters={search:state.search,category:state.category,priority:state.priority};
 const update=()=>{const rows=filteredEvents({...ctx,state:{...state,...filters}},watch);field(root,'event-rows').innerHTML=tableRows(ctx,rows);field(root,'event-count').textContent=rows.length+' EVENTS';field(root,'event-empty').hidden=rows.length>0};
 const off=[bindActions(root,ctx.actions)];for(const [id,key]of [['event-search','search'],['event-type-filter','category'],['priority-filter','priority']]){const el=field(root,id);if(el)off.push(listen(el,id==='event-search'?'input':'change',()=>{ctx.actions.setFilter(key,el.value);filters[key]=el.value;update()}))}return ()=>off.reverse().forEach(f=>f())}
export default {id:'monitor',number:'0204',command:'FIL',desk:'market',title:'Disclosure Monitor',defaultSlot:3,render:ctx=>eventPanel(ctx),mount:mountFilings};
