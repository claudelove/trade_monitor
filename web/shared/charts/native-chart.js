import {readTypography,watchTypography} from '../ui/theme.js';
import {ChartModel} from './model.js';
import {observationChange,sourceClock,visibleEndIndex,axisPrecision} from './quote-data.js';
import {movingAverage,sourceData,zeroAutoscale} from './native-series.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumFractionDigits:4}):'N/A';
const studyColors={5:'#ffcb4a',20:'#df75db',60:'#59c89d'};
const direction=value=>value==null?'muted':value>0?'positive':value<0?'negative':'muted';
const signed=value=>Number.isFinite(value)?(value>0?'+':'')+number(value):'—';
export class NativeChart {
 constructor(root,options={}){this.root=root;this.options=options;this.state=options.state||{};this.disposed=false;this.cleanups=[];this.series=[];this.setData(options)}
 setData(options){if(this.disposed)return;Object.assign(this.options,options);if(this.state.key&&this.state.key!==this.options.key){delete this.state.start;delete this.state.end;this.state.followLast=true;this.state.rangeCount=60;}if(!Array.isArray(this.state.studies))this.state.studies=[...(this.options.defaultStudies||[5,20,60])].filter(n=>[5,20,60].includes(n));this.generation=(this.generation||0)+1;const generation=this.generation;
  this.cleanup();this.model=new ChartModel(this.options.series||[],this.options);this.mode=this.state.mode||'candle';this.linked=this.state.linked===true;
  this.root.classList.add('terminal-chart-host','native-chart');this.root.innerHTML='<div class="empty">Loading financial chart…</div>';
  import('./vendor/lightweight-charts.js').then(lib=>{if(!this.disposed&&generation===this.generation){this.lib=lib;this.build()}}).catch(()=>{if(this.disposed||generation!==this.generation)return;this.cleanup();if(!this.disposed)this.root.innerHTML='<div class="empty" role="alert">Chart renderer unavailable. Check the packaged assets.</div>'});
 }
 build(){const candle=this.model.series.some(s=>s.type==='candle');
  this.root.innerHTML=`<div class="hts-chart-toolbar"><span class="chart-field">${esc(this.options.title||'CHART')}</span>${[20,60,'all'].map(n=>`<button data-native-range="${n}">${n==='all'?'ALL':n+'B'}</button>`).join('')}<button data-native-zoom="0.75" aria-label="Zoom in">+</button><button data-native-zoom="1.3" aria-label="Zoom out">−</button><button data-native-reset>LATEST</button>${candle?'<button data-native-mode="candle">CANDLE</button><button data-native-mode="line">LINE</button><span class="chart-field">MA</span>'+[5,20,60].map(n=>`<button data-native-ma="${n}" aria-pressed="${(this.state.studies||[]).includes(n)}">${n}</button>`).join(''):''}<button data-native-link aria-pressed="${this.linked}" ${this.options.linkGroup?'':'disabled'} title="Opt-in exact-time link within the same run/source/symbol">LINK</button></div><div class="hts-source-quote" aria-label="Last loaded source value"></div><div class="hts-quote-line" role="status"></div><div class="hts-study-values" aria-label="Trailing moving averages"></div><div class="financial-chart-surface"><div class="financial-chart-canvas"></div><div class="financial-chart-tooltip" hidden></div></div><div class="hts-chart-status"><span data-chart-window></span><span>Drag / wheel · price-axis scale · double-click latest</span><a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView Lightweight Charts™</a></div>`;
  this.canvas=this.root.querySelector('.financial-chart-canvas');this.tooltip=this.root.querySelector('.financial-chart-tooltip');this.readout=this.root.querySelector('.hts-quote-line');this.canvas.tabIndex=0;this.canvas.setAttribute('role','region');this.canvas.setAttribute('aria-label','Source price chart. Left/right inspect bars; plus/minus zoom; Home first bar; End latest; Escape clears cursor.');
  const L=this.lib,typography=readTypography(this.root);this.chart=L.createChart(this.canvas,{
   layout:{background:typography.background,textColor:typography.textColor,fontFamily:typography.fontFamily,fontSize:typography.fontSize,attributionLogo:true,panes:{separatorColor:'#666666',separatorHoverColor:'#999999',enableResize:true}},
   grid:{vertLines:{visible:false},horzLines:{color:'#242424',style:L.LineStyle.Dotted}},
   crosshair:{mode:L.CrosshairMode.Normal,vertLine:{color:'#aaa',style:L.LineStyle.Dashed,labelBackgroundColor:'#555'},horzLine:{color:'#aaa',style:L.LineStyle.Dashed,labelBackgroundColor:'#555'}},
   rightPriceScale:{visible:true,borderColor:'#777',scaleMargins:{top:.08,bottom:.08}},leftPriceScale:{visible:this.model.series.some(s=>s.axis==='left'),borderColor:'#777'},
   timeScale:{borderColor:'#777',lockVisibleTimeRangeOnResize:true,rightOffset:3,barSpacing:8,minBarSpacing:2,timeVisible:true,secondsVisible:false,tickMarkFormatter:(t,type)=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',...(type===L.TickMarkType.Time||type===L.TickMarkType.TimeWithSeconds?{hour:'2-digit',minute:'2-digit',hour12:false}:{month:'short',day:'2-digit'})}).format(Number(t)*1000)},
   localization:{locale:'en-GB',timeFormatter:t=>sourceClock(this.model,Number(t)*1000)},
   handleScroll:{mouseWheel:true,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},handleScale:{axisPressedMouseMove:true,mouseWheel:true,pinch:true}
  });
  this.cleanups.push(watchTypography(this.root,layout=>{if(!this.disposed&&this.chart)this.chart.applyOptions({layout})}));
  this.renderSeries();
  this.onCross=param=>{if(this.applying)return;if(param.time==null){this.cursorTime=null;this.tooltip.hidden=true;this.quote(this.model.timeline.at(-1));if(this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'cursor',time:null},this.receive);return}const time=Number(param.time)*1000;this.cursorTime=time;this.quote(time);
   if(param.point){this.tooltip.hidden=false;this.tooltip.style.left=param.point.x>this.canvas.clientWidth/2?'8px':'auto';this.tooltip.style.right=param.point.x>this.canvas.clientWidth/2?'auto':(this.chart.priceScale('right').width()+8)+'px'}
   if(this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'cursor',time},this.receive)
  };
  this.onRange=()=>{if(this.applying)return;const range=this.chart.timeScale().getVisibleRange();if(!range)return;
   Object.assign(this.state,{key:this.options.key,start:Number(range.from)*1000,end:Number(range.to)*1000,mode:this.mode,linked:this.linked});
   const from=this.model.timeline.findIndex(t=>t>=this.state.start),to=this.model.timeline.findLastIndex(t=>t<=this.state.end);
   this.root.querySelector('[data-chart-window]').textContent=`${from<0||to<from?'NO OBSERVATIONS IN VIEW':(Math.max(0,from)+1)+'–'+(to+1)} / ${this.model.timeline.length} observations · ${this.state.followLast===false?'HISTORY':'FOLLOW LAST'}`;
   if(this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'range',start:this.state.start,end:this.state.end},this.receive)
  };
  this.chart.subscribeCrosshairMove(this.onCross);this.chart.timeScale().subscribeVisibleTimeRangeChange(this.onRange);
  this.receive=event=>{if(!this.linked||this.disposed)return;this.applying=true;try{if(event.kind==='range'){this.state.followLast=false;this.state.start=event.start;this.state.end=event.end;this.chart.timeScale().setVisibleRange({from:event.start/1000,to:event.end/1000})}else if(event.kind==='cursor'){if(event.time==null){this.cursorTime=null;this.chart.clearCrosshairPosition();this.tooltip.hidden=true;this.quote(this.model.timeline.at(-1))}else this.inspect(event.time,{emit:false,reveal:false})}}finally{this.applying=false}};
  this.cleanups.push(this.options.bus?.subscribe(this.options.linkGroup,this.receive)||(()=>{}));
  for(const button of this.root.querySelectorAll('[data-native-range]'))button.onclick=()=>this.range(button.dataset.nativeRange);
  for(const button of this.root.querySelectorAll('[data-native-zoom]'))button.onclick=()=>this.zoom(Number(button.dataset.nativeZoom));
  for(const button of this.root.querySelectorAll('[data-native-mode]'))button.onclick=()=>{this.mode=button.dataset.nativeMode;this.state.mode=this.mode;this.rebuild()};
  for(const button of this.root.querySelectorAll('[data-native-ma]'))button.onclick=()=>{const n=Number(button.dataset.nativeMa),set=new Set(this.state.studies||[]);set.has(n)?set.delete(n):set.add(n);this.state.studies=[...set];this.rebuild()};
  this.root.querySelector('[data-native-reset]').onclick=()=>this.range(60);
  this.root.querySelector('[data-native-link]').onclick=event=>{this.linked=!this.linked;this.state.linked=this.linked;event.target.setAttribute('aria-pressed',String(this.linked))};
  this.onDouble=()=>this.range(60);this.canvas.addEventListener('dblclick',this.onDouble);
  this.onHistory=()=>{this.state.followLast=false};this.canvas.addEventListener('wheel',this.onHistory,{passive:true});this.onDrag=event=>{if(event.buttons)this.state.followLast=false};this.canvas.addEventListener('pointermove',this.onDrag);this.cleanups.push(()=>{this.canvas.removeEventListener('wheel',this.onHistory);this.canvas.removeEventListener('pointermove',this.onDrag);this.canvas.removeEventListener('dblclick',this.onDouble)});
  this.onKey=event=>this.keydown(event);this.onFocus=()=>this.canvas.focus({preventScroll:true});this.canvas.addEventListener('keydown',this.onKey);this.canvas.addEventListener('pointerdown',this.onFocus);this.cleanups.push(()=>{this.canvas.removeEventListener('keydown',this.onKey);this.canvas.removeEventListener('pointerdown',this.onFocus)});
  const body=this.root.closest('.window-body');this.resize=()=>{if(this.disposed)return;const width=this.canvas.clientWidth;
   const top=body?this.root.getBoundingClientRect().top-body.getBoundingClientRect().top+body.scrollTop:0;
   const chrome=[...this.root.children].filter(el=>el!==this.root.querySelector('.financial-chart-surface')).reduce((sum,el)=>sum+el.getBoundingClientRect().height,0);
   const height=Math.max(this.options.minHeight||160,body?body.clientHeight-top-chrome:360);
   if(width&&`${width}:${height}`!==this.size){const current=this.chart.panes(),total=current.reduce((sum,p)=>sum+p.getHeight(),0),fraction=this.size&&current.length>1&&total?current[1].getHeight()/total:this.state.volumeFraction??.23;this.state.volumeFraction=Math.max(.1,Math.min(.5,fraction));this.size=`${width}:${height}`;this.canvas.style.height=height+'px';this.chart.resize(width,height);const panes=this.chart.panes();if(panes.length>1){panes[0].setHeight(Math.round(height*(1-this.state.volumeFraction)));panes[1].setHeight(Math.round(height*this.state.volumeFraction))}}};
  this.observer=new ResizeObserver(this.resize);this.observer.observe(body||this.root);if(body)this.observer.observe(this.root);this.root.ownerDocument.addEventListener('toggle',this.resize,true);this.cleanups.push(()=>this.root.ownerDocument.removeEventListener('toggle',this.resize,true));this.resize();
  if(this.state.followLast===false&&this.state.key===this.options.key&&Number.isFinite(this.state.start)&&Number.isFinite(this.state.end)&&this.state.end>this.state.start){try{this.chart.timeScale().setVisibleRange({from:this.state.start/1000,to:this.state.end/1000})}catch{this.range(60)}}else this.range(this.state.rangeCount||60);
  this.sourceSummary();this.quote(this.model.timeline.at(-1));this.onRange();if(!this.model.timeline.length){for(const button of this.root.querySelectorAll('.hts-chart-toolbar button'))button.disabled=true;this.root.querySelector('[data-chart-window]').textContent='NO SOURCE BARS';}
 }
 renderSeries(){const L=this.lib;this.series=[];this.studyValues=[];for(const s of this.model.series){
   const precision=axisPrecision(s),axisValue=value=>Number.isFinite(value)?value.toLocaleString('en-US',{maximumFractionDigits:precision}):'N/A';
   const api=this.chart.addSeries(s.type==='candle'&&this.mode==='candle'?L.CandlestickSeries:L.LineSeries,s.type==='candle'&&this.mode==='candle'?{upColor:'#ff4848',downColor:'#4b85ff',borderUpColor:'#ff4848',borderDownColor:'#4b85ff',wickUpColor:'#ff6464',wickDownColor:'#709fff',priceScaleId:s.axis,lastValueVisible:true,priceLineVisible:true,priceFormat:{type:'custom',formatter:axisValue,minMove:10**(-precision)}}:{color:s.color||'#eeeeee',lineWidth:1,priceScaleId:s.axis,lastValueVisible:true,priceLineVisible:true,priceFormat:s.format==='percent'?{type:'custom',formatter:v=>(v*100).toFixed(2)+'%'}:{type:'custom',formatter:axisValue,minMove:10**(-precision)}});
   api.setData(sourceData(s,this.mode,this.model.timeline));if(this.model.zero){api.applyOptions({autoscaleInfoProvider:base=>zeroAutoscale(base())});api.createPriceLine({price:0,color:'#777777',lineWidth:1,lineStyle:L.LineStyle.Dashed,axisLabelVisible:true,title:'ZERO'});}this.series.push(api);
   if(s.type==='candle'){
    const volume=this.chart.addSeries(L.HistogramSeries,{priceFormat:{type:'volume'},priceLineVisible:false,lastValueVisible:true},1);
    volume.setData(s.points.map(p=>({time:p.time/1000,...(p.volume==null?{}:{value:p.volume,color:p.close>=p.open?'#a54c4c':'#3c5d9d'})})));
    for(const period of this.state.studies||[]){const colors=studyColors,ma=this.chart.addSeries(L.LineSeries,{color:colors[period]||'#ffe000',lineWidth:1,priceLineVisible:false,lastValueVisible:true,title:'MA '+period});const values=movingAverage(s.points,period);ma.setData(values);this.studyValues.push({label:(this.model.series.length>1?s.label+' / ':'')+'MA '+period,color:colors[period],byTime:new Map(values.filter(p=>Number.isFinite(p.value)).map(p=>[p.time*1000,p.value]))})}
   }
  }
 }
 quote(time){if(time==null){this.readout.textContent='NO SOURCE BARS · No synthetic candles are generated.';return}
  const rows=[`<span class="quote-time">${esc(sourceClock(this.model,time))}</span>`];let tip='';
  for(const s of this.model.series){const p=s.byTime.get(time);if(!p)continue;
   if(s.type==='candle'){rows.push(...[['O',p.open],['H',p.high],['L',p.low],['C',p.close],['VOL',p.volume]].map(([k,v])=>`<span>${k} <b>${esc(number(v))}</b></span>`));tip+=`<b>${esc(s.label||s.id)}</b><dl>${[['OPEN',p.open],['HIGH',p.high],['LOW',p.low],['CLOSE',p.close],['VOLUME',p.volume]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(number(v))}</dd>`).join('')}</dl>`}
   else rows.push(`<span>${esc(s.label||s.id)} <b>${esc(s.format==='percent'&&Number.isFinite(p.value)?(p.value*100).toFixed(3)+'%':number(p.value))}</b> ${esc(s.unit)}</span>`)
  }
  this.root.querySelector('.hts-study-values').innerHTML=(this.studyValues||[]).map(study=>`<span style="color:${study.color}">${esc(study.label)} <b>${esc(number(study.byTime.get(time)))}</b></span>`).join('');
  this.readout.innerHTML=rows.join('');this.tooltip.innerHTML=`<span>${esc(sourceClock(this.model,time))}</span>${tip}`;
 }
 range(count){const length=this.model.timeline.length;if(!length)return;this.cursorTime=null;this.tooltip.hidden=true;this.quote(this.model.timeline.at(-1));this.state.followLast=true;this.state.rangeCount=count;const n=count==='all'?length:Math.min(length,Number(count)||60);this.chart.timeScale().setVisibleLogicalRange({from:Math.max(0,length-n)-.5,to:length+2});for(const b of this.root.querySelectorAll('[data-native-range]'))b.classList.toggle('active',String(count)===b.dataset.nativeRange)}
 sourceSummary(){const series=this.model.series[0],last=series?.points.at(-1),box=this.root.querySelector('.hts-source-quote');if(!last){box.textContent='NO SOURCE OBSERVATIONS';return}
  const value=last.close??last.value,change=series.type==='candle'?observationChange(series,last.time):null;
  box.innerHTML=`<span class="quote-source-label">LAST SOURCE</span><strong class="${direction(change?.delta)}">${esc(series.format==='percent'&&Number.isFinite(value)?(value*100).toFixed(3)+'%':number(value))}</strong><span>${esc(series.unit)}</span>${change?`<span class="${direction(change.delta)}" title="Compared with the previous loaded source observation, not necessarily the previous session">Δ BAR ${esc(signed(change.delta))} / ${change.percent==null?'—':esc((change.percent>0?'+':'')+(change.percent*100).toFixed(2))+'%'}</span>`:''}<span class="quote-time">${esc(sourceClock(this.model,last.time))}</span>`;
 }
 zoom(factor){this.state.followLast=false;const range=this.chart.timeScale().getVisibleLogicalRange();if(range){const count=Math.max(Math.min(2,this.model.timeline.length),Math.min(this.model.timeline.length+4,(range.to-range.from)*factor));this.chart.timeScale().setVisibleLogicalRange({from:range.to-count,to:range.to})}}
 inspect(time,{emit=true,reveal=true}={}){const index=this.model.timeline.indexOf(time);if(index<0){this.chart.clearCrosshairPosition();this.tooltip.hidden=true;this.readout.textContent='LINKED TIME NOT IN THIS SOURCE';return}this.cursorTime=time;
  if(reveal){const range=this.chart.timeScale().getVisibleLogicalRange();if(range&&(index<range.from||index>range.to)){const count=range.to-range.from,from=index<range.from?index-1:index-count+1;this.chart.timeScale().setVisibleLogicalRange({from,to:from+count})}}
  const sourceIndex=this.model.series.findIndex(s=>{const p=s.byTime.get(time);return Number.isFinite(p?.close??p?.value)}),source=this.model.series[sourceIndex],row=source?.byTime.get(time);
  const wasApplying=this.applying;this.applying=true;try{if(row)this.chart.setCrosshairPosition(row.close??row.value,time/1000,this.series[sourceIndex])}finally{this.applying=wasApplying}
  this.quote(time);this.tooltip.hidden=false;this.tooltip.style.left='8px';this.tooltip.style.right='auto';if(emit&&this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'cursor',time},this.receive);
 }
 keydown(event){const times=this.model.timeline;if(!times.length)return;
  if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();this.state.followLast=false;const visible=this.chart.timeScale().getVisibleRange(),base=this.cursorTime==null?visibleEndIndex(times,visible?.to??times.at(-1)/1000):times.indexOf(this.cursorTime),index=Math.max(0,Math.min(times.length-1,base+(event.key==='ArrowLeft'?-1:1)));this.inspect(times[index]);}
  else if(['+','=','-'].includes(event.key)){event.preventDefault();this.zoom(event.key==='-'?1.3:.75)}
  else if(event.key==='Home'){event.preventDefault();this.state.followLast=false;const count=this.state.rangeCount==='all'?times.length:Number(this.state.rangeCount)||60;this.chart.timeScale().setVisibleLogicalRange({from:-.5,to:Math.min(count,times.length)-.5});this.inspect(times[0]);}
  else if(event.key==='End'){event.preventDefault();this.range(this.state.rangeCount||60);this.inspect(times.at(-1));}
  else if(event.key==='Escape'){event.preventDefault();this.cursorTime=null;this.applying=true;try{this.chart.clearCrosshairPosition()}finally{this.applying=false}this.tooltip.hidden=true;this.quote(times.at(-1));if(this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'cursor',time:null},this.receive)}
 }
 rebuild(){const options=this.options;this.setData(options)}
 cleanup(){for(const off of this.cleanups.splice(0))off();this.observer?.disconnect();if(this.chart){const panes=this.chart.panes(),total=panes.reduce((sum,p)=>sum+p.getHeight(),0);if(panes.length>1&&total)this.state.volumeFraction=Math.max(.1,Math.min(.5,panes[1].getHeight()/total));if(this.onCross)this.chart.unsubscribeCrosshairMove(this.onCross);if(this.onRange)this.chart.timeScale().unsubscribeVisibleTimeRangeChange(this.onRange);this.chart.remove();this.chart=null}this.series=[];this.size=null}
 dispose(){if(this.disposed)return;this.disposed=true;this.generation++;this.cleanup();this.root.replaceChildren()}
}
