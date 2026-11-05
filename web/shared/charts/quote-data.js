// Display-only source comparisons. Never infer session/day returns from arbitrary bars.
export function observationChange(series,time){
 const points=series.points;let lo=0,hi=points.length-1;
 while(lo<=hi){const mid=(lo+hi)>>1;if(points[mid].time<time)lo=mid+1;else if(points[mid].time>time)hi=mid-1;else{const current=points[mid].close??points[mid].value,previous=points[mid-1]?.close??points[mid-1]?.value;
  if(!Number.isFinite(current)||!Number.isFinite(previous))return {delta:null,percent:null,previous:null};
  const delta=current-previous,percent=previous>0?delta/previous:null;return {delta:Number.isFinite(delta)?delta:null,percent:Number.isFinite(percent)?percent:null,previous};}}
 return {delta:null,percent:null,previous:null};
}
export function sourceClock(model,time){
 const daily=model.series.map(s=>s.byTime.get(time)?.timestamp).find(t=>typeof t==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(t));
 if(daily)return daily+' · exact time unavailable';
 return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(time)+' KST';
}
export function visibleEndIndex(timeline,to){let index=timeline.findLastIndex(time=>time<=to*1000);return index<0?timeline.length-1:index;}

// Axis display precision only: this is not a broker/exchange tick-size rule.
export function axisPrecision(series){
 if(Number.isInteger(series.displayPrecision)&&series.displayPrecision>=0&&series.displayPrecision<=8)return series.displayPrecision;
 if(series.type==='candle'&&series.points.every(p=>['open','high','low','close'].every(key=>Number.isInteger(p[key]))))return 0;
 return 4;
}
