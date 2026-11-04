const finite=value=>typeof value==='number'&&Number.isFinite(value);
export function epoch(value){if(typeof value!=='string'||!(/^\d{4}-\d{2}-\d{2}$/.test(value)||/(Z|[+-]\d\d:\d\d)$/.test(value)))throw Error('차트 시각에 날짜 또는 시간대가 필요합니다.');const time=Date.parse(value);if(!Number.isFinite(time)||/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(time).toISOString().slice(0,10)!==value)throw Error('유효하지 않은 차트 시각입니다.');return time}
export function normalize(series){
 if(!Array.isArray(series)||series.length>8)throw Error('차트는 최대 8개 series를 지원합니다.');const ids=new Set(),units=new Map();
 return series.map(s=>{if(!s||typeof s.id!=='string'||ids.has(s.id)||!['line','candle'].includes(s.type)||!Array.isArray(s.data)||s.data.length>50000)throw Error('차트 series 형식을 확인하세요.');ids.add(s.id);const axis=s.axis||'right',unit=s.unit||'';if(!['left','right'].includes(axis)||units.has(axis)&&units.get(axis)!==unit)throw Error('같은 축에는 같은 단위를 사용하세요.');units.set(axis,unit);const seen=new Set();const points=s.data.map(p=>{const time=epoch(p.timestamp);if(seen.has(time))throw Error('동일 series의 중복 시각입니다.');seen.add(time);const row={...p,time};if(s.type==='line'&&p.value!==null&&!finite(p.value))throw Error('차트 값은 유한 숫자 또는 null이어야 합니다.');if(s.type==='candle'){if(!['open','high','low','close'].every(k=>finite(p[k]))||p.low>Math.min(p.open,p.close)||p.high<Math.max(p.open,p.close)||p.low>p.high)throw Error('유효한 OHLC가 필요합니다.');if(p.volume!=null&&(!finite(p.volume)||p.volume<0))throw Error('유효한 거래량이 필요합니다.')}return row}).sort((a,b)=>a.time-b.time);return {...s,axis,unit,points,byTime:new Map(points.map(p=>[p.time,p]))}});
}
export class ChartModel {
 constructor(series,{count=60,zero=false}={}){this.series=normalize(series);this.timeline=[...new Set(this.series.flatMap(s=>s.points.map(p=>p.time)))].sort((a,b)=>a-b);this.zero=zero;this.defaultCount=count;this.count=Math.min(this.timeline.length,count==='all'?this.timeline.length:Math.max(1,Number(count)||60));this.start=Math.max(0,this.timeline.length-this.count)}
 get end(){return this.start+this.count}
 get visible(){return this.timeline.slice(this.start,this.end)}
 range(count){this.count=Math.min(this.timeline.length,count==='all'?this.timeline.length:Math.max(1,Number(count)||1));this.start=Math.max(0,this.timeline.length-this.count)}
 pan(delta){this.start=Math.max(0,Math.min(this.timeline.length-this.count,this.start+Math.round(delta)))}
 zoom(factor,anchor=.5){if(!this.timeline.length)return;const oldCount=this.count,point=this.start+anchor*(oldCount-1);this.count=Math.max(Math.min(5,this.timeline.length),Math.min(this.timeline.length,Math.round(oldCount*factor)));this.start=Math.max(0,Math.min(this.timeline.length-this.count,Math.round(point-anchor*(this.count-1))))}
 rangeByTime(start,end){const a=this.timeline.findIndex(t=>t>=start),last=this.timeline.findLastIndex(t=>t<=end);if(a<0||last<a)return false;this.start=a;this.count=last-a+1;return true}
 scales(mode='candle'){const scales={};for(const s of this.series){const values=this.visible.flatMap(t=>{const p=s.byTime.get(t);return !p?[]:s.type==='candle'?(mode==='line'?[p.close]:[p.low,p.high]):finite(p.value)?[p.value]:[]});if(!values.length)continue;let scale=scales[s.axis];if(!scale)scale=scales[s.axis]={min:Infinity,max:-Infinity,unit:s.unit,format:s.format};scale.min=Math.min(scale.min,...values);scale.max=Math.max(scale.max,...values)}for(const scale of Object.values(scales)){if(this.zero){scale.min=Math.min(0,scale.min);scale.max=Math.max(0,scale.max)}const pad=(scale.max-scale.min)*.08||Math.abs(scale.max)*.02||1;scale.min-=pad;scale.max+=pad}return scales}
 snapshot(){return {start:this.visible[0],end:this.visible.at(-1)}}
}
export function segments(times,series){const groups=[];let current=[];for(const time of times){const p=series.byTime.get(time);if(!p||p.value==null){if(current.length)groups.push(current);current=[]}else current.push(p)}if(current.length)groups.push(current);return groups}
export class ChartLinkBus {
 constructor(){this.groups=new Map()}
 subscribe(group,listener){if(!group)return ()=>{};if(!this.groups.has(group))this.groups.set(group,new Set());this.groups.get(group).add(listener);return ()=>{const listeners=this.groups.get(group);listeners?.delete(listener);if(!listeners?.size)this.groups.delete(group)}}
 publish(group,event,sender){for(const listener of this.groups.get(group)||[])if(listener!==sender)listener(event)}
 get size(){return [...this.groups.values()].reduce((sum,listeners)=>sum+listeners.size,0)}
}
