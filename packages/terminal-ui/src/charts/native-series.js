// Exact source timestamps and trailing-only studies. Never invent an OHLC bar.
export function movingAverage(points,window){
 if(!Number.isInteger(window)||window<2)throw Error('Invalid moving-average window');
 return points.map((p,i)=>{const rows=points.slice(Math.max(0,i-window+1),i+1),values=rows.map(x=>x.close??x.value);
  return {time:p.time/1000,...(rows.length===window&&values.every(Number.isFinite)?{value:values.reduce((a,b)=>a+b,0)/window}:{})}});
}
export const chartTime=point=>point.time/1000;
export function sourceData(series,mode='candle',timeline=null){
 const points=timeline?timeline.map(time=>series.byTime.get(time)||{time}):series.points;
 return points.map(p=>{const time=chartTime(p);if(series.type==='candle'&&mode==='candle')return p.open==null?{time}:{time,open:p.open,high:p.high,low:p.low,close:p.close};
  const value=series.type==='candle'?p.close:p.value;return Number.isFinite(value)?{time,value}:{time}});
}

// Preserve a zero reference for drawdown/exposure without changing observations.
export function zeroAutoscale(info){return info?{...info,priceRange:{minValue:Math.min(0,info.priceRange.minValue),maxValue:Math.max(0,info.priceRange.maxValue)}}:null;}
