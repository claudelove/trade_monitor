import {ChartModel} from './model.js';
import {movingAverage,sourceData,zeroAutoscale} from './native-series.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=v=>Number.isFinite(v)?v.toLocaleString('en-US',{maximumFractionDigits:4}):'N/A';
const sourceClock=(model,time)=>{const date=model.series.map(s=>s.byTime.get(time)?.timestamp).find(t=>typeof t==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(t));return date?date+' · exact time unavailable':clock(time)};
const clock=time=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(time)+' KST';
export class NativeChart {
 constructor(root,options={}){this.root=root;this.options=options;this.state=options.state||{};this.disposed=false;this.cleanups=[];this.series=[];this.setData(options)}
 setData(options){if(this.disposed)return;Object.assign(this.options,options);if(this.state.key&&this.state.key!==this.options.key){delete this.state.start;delete this.state.end;this.state.followLast=true;this.state.rangeCount=60;}this.generation=(this.generation||0)+1;const generation=this.generation;
  this.cleanup();this.model=new ChartModel(this.options.series||[],this.options);this.mode=this.state.mode||'candle';this.linked=this.state.linked===true;
  this.root.classList.add('terminal-chart-host','native-chart');this.root.innerHTML='<div class="empty">Loading financial chart…</div>';
  import('./vendor/lightweight-charts.js').then(lib=>{if(!this.disposed&&generation===this.generation){this.lib=lib;this.build()}}).catch(()=>{if(this.disposed||generation!==this.generation)return;this.cleanup();if(!this.disposed)this.root.innerHTML='<div class="empty" role="alert">Chart renderer unavailable. Check the packaged assets.</div>'});
 }
 build(){const candle=this.model.series.some(s=>s.type==='candle');
  this.root.innerHTML=`<div class="hts-chart-toolbar"><span class="chart-field">${esc(this.options.title||'CHART')}</span>${[20,60,'all'].map(n=>`<button data-native-range="${n}">${n==='all'?'ALL':n+'B'}</button>`).join('')}<button data-native-zoom="0.75" aria-label="Zoom in">+</button><button data-native-zoom="1.3" aria-label="Zoom out">−</button><button data-native-reset>LATEST</button>${candle?'<button data-native-mode="candle">CANDLE</button><button data-native-mode="line">LINE</button><span class="chart-field">MA</span>'+[5,20,60].map(n=>`<button data-native-ma="${n}" aria-pressed="${(this.state.studies||[]).includes(n)}">${n}</button>`).join(''):''}<button data-native-link aria-pressed="${this.linked}" ${this.options.linkGroup?'':'disabled'} title="Opt-in exact-time link within the same run/source/symbol">LINK</button></div><div class="hts-quote-line" role="status"></div><div class="financial-chart-surface"><div class="financial-chart-canvas"></div><div class="financial-chart-tooltip" hidden></div></div><div class="hts-chart-status"><span data-chart-window></span><span>Drag / wheel · price-axis scale · double-click latest</span><a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView Lightweight Charts™</a></div>`;
  this.canvas=this.root.querySelector('.financial-chart-canvas');this.tooltip=this.root.querySelector('.financial-chart-tooltip');this.readout=this.root.querySelector('.hts-quote-line');
  const L=this.lib;this.chart=L.createChart(this.canvas,{
   layout:{background:{type:L.ColorType.Solid,color:'#000000'},textColor:'#d6d6d6',fontFamily:'"IBM Plex Mono",Consolas,"Liberation Mono",monospace',fontSize:11,attributionLogo:true,panes:{separatorColor:'#666666',separatorHoverColor:'#999999',enableResize:true}},
   grid:{vertLines:{color:'#242424',style:L.LineStyle.Dotted},horzLines:{color:'#303030',style:L.LineStyle.Dotted}},
   crosshair:{mode:L.CrosshairMode.Normal,vertLine:{color:'#aaa',style:L.LineStyle.Dashed,labelBackgroundColor:'#555'},horzLine:{color:'#aaa',style:L.LineStyle.Dashed,labelBackgroundColor:'#555'}},
   rightPriceScale:{visible:true,borderColor:'#777',scaleMargins:{top:.08,bottom:.08}},leftPriceScale:{visible:this.model.series.some(s=>s.axis==='left'),borderColor:'#777'},
   timeScale:{borderColor:'#777',rightOffset:3,barSpacing:8,minBarSpacing:2,timeVisible:true,secondsVisible:false,tickMarkFormatter:(t,type)=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',...(type===L.TickMarkType.Time||type===L.TickMarkType.TimeWithSeconds?{hour:'2-digit',minute:'2-digit',hour12:false}:{month:'short',day:'2-digit'})}).format(Number(t)*1000)},
   localization:{locale:'en-GB',timeFormatter:t=>sourceClock(this.model,Number(t)*1000)},
   handleScroll:{mouseWheel:true,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},handleScale:{axisPressedMouseMove:true,mouseWheel:true,pinch:true}
  });
  this.renderSeries();
  this.onCross=param=>{if(this.applying)return;if(param.time==null){this.tooltip.hidden=true;this.quote(this.model.timeline.at(-1));return}const time=Number(param.time)*1000;this.quote(time);
   if(param.point){this.tooltip.hidden=false;this.tooltip.style.left=param.point.x>this.canvas.clientWidth/2?'8px':'auto';this.tooltip.style.right=param.point.x>this.canvas.clientWidth/2?'auto':'85px'}
   if(this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'cursor',time},this.receive)
  };
  this.onRange=()=>{if(this.applying)return;const range=this.chart.timeScale().getVisibleRange();if(!range)return;
   Object.assign(this.state,{key:this.options.key,start:Number(range.from)*1000,end:Number(range.to)*1000,mode:this.mode,linked:this.linked});
   const from=this.model.timeline.findIndex(t=>t>=this.state.start),to=this.model.timeline.findLastIndex(t=>t<=this.state.end);
   this.root.querySelector('[data-chart-window]').textContent=`${Math.max(0,from)+1}–${to+1} / ${this.model.timeline.length} observations · ${this.state.followLast===false?'HISTORY':'FOLLOW LAST'}`;
   if(this.linked)this.options.bus?.publish(this.options.linkGroup,{kind:'range',start:this.state.start,end:this.state.end},this.receive)
  };
  this.chart.subscribeCrosshairMove(this.onCross);this.chart.timeScale().subscribeVisibleTimeRangeChange(this.onRange);
  this.receive=event=>{if(!this.linked||this.disposed)return;this.applying=true;try{if(event.kind==='range'){this.state.followLast=false;this.state.start=event.start;this.state.end=event.end;this.chart.timeScale().setVisibleRange({from:event.start/1000,to:event.end/1000})}else if(event.kind==='cursor'){if(event.time==null)this.chart.clearCrosshairPosition();else{const row=this.model.series[0]?.byTime.get(event.time);if(row){const value=row.close??row.value;if(Number.isFinite(value)){this.chart.setCrosshairPosition(value,event.time/1000,this.series[0]);this.quote(event.time)}}}}}finally{this.applying=false}};
  this.cleanups.push(this.options.bus?.subscribe(this.options.linkGroup,this.receive)||(()=>{}));
  for(const button of this.root.querySelectorAll('[data-native-range]'))button.onclick=()=>this.range(button.dataset.nativeRange);
  for(const button of this.root.querySelectorAll('[data-native-zoom]'))button.onclick=()=>{this.state.followLast=false;const range=this.chart.timeScale().getVisibleLogicalRange();if(range){const count=(range.to-range.from)*Number(button.dataset.nativeZoom);this.chart.timeScale().setVisibleLogicalRange({from:range.to-count,to:range.to})}};
  for(const button of this.root.querySelectorAll('[data-native-mode]'))button.onclick=()=>{this.mode=button.dataset.nativeMode;this.state.mode=this.mode;this.rebuild()};
  for(const button of this.root.querySelectorAll('[data-native-ma]'))button.onclick=()=>{const n=Number(button.dataset.nativeMa),set=new Set(this.state.studies||[]);set.has(n)?set.delete(n):set.add(n);this.state.studies=[...set];this.rebuild()};
  this.root.querySelector('[data-native-reset]').onclick=()=>this.range(60);
  this.root.querySelector('[data-native-link]').onclick=event=>{this.linked=!this.linked;this.state.linked=this.linked;event.target.setAttribute('aria-pressed',String(this.linked))};
  this.onDouble=()=>this.range(60);this.canvas.addEventListener('dblclick',this.onDouble);
  this.onHistory=()=>{this.state.followLast=false};this.canvas.addEventListener('wheel',this.onHistory,{passive:true});this.onDrag=event=>{if(event.buttons)this.state.followLast=false};this.canvas.addEventListener('pointermove',this.onDrag);this.cleanups.push(()=>{this.canvas.removeEventListener('wheel',this.onHistory);this.canvas.removeEventListener('pointermove',this.onDrag);this.canvas.removeEventListener('dblclick',this.onDouble)});
  const body=this.root.closest('.window-body');this.resize=()=>{if(this.disposed)return;const width=this.canvas.clientWidth;
   const top=body?this.root.getBoundingClientRect().top-body.getBoundingClientRect().top+body.scrollTop:0;
   const height=Math.max(this.options.minHeight||180,body?body.clientHeight-top-86:360);
   if(width&&`${width}:${height}`!==this.size){this.size=`${width}:${height}`;this.canvas.style.height=height+'px';this.chart.resize(width,height);const panes=this.chart.panes();if(panes.length>1){panes[0].setHeight(Math.round(height*.77));panes[1].setHeight(Math.round(height*.23))}}};
  this.observer=new ResizeObserver(this.resize);this.observer.observe(body||this.root);this.root.ownerDocument.addEventListener('toggle',this.resize,true);this.cleanups.push(()=>this.root.ownerDocument.removeEventListener('toggle',this.resize,true));this.resize();
  if(this.state.followLast===false&&this.state.key===this.options.key&&Number.isFinite(this.state.start)&&Number.isFinite(this.state.end)&&this.state.end>this.state.start){try{this.chart.timeScale().setVisibleRange({from:this.state.start/1000,to:this.state.end/1000})}catch{this.range(60)}}else this.range(this.state.rangeCount||60);
  this.quote(this.model.timeline.at(-1));this.onRange();
 }
 renderSeries(){const L=this.lib;this.series=[];for(const s of this.model.series){
   const api=this.chart.addSeries(s.type==='candle'&&this.mode==='candle'?L.CandlestickSeries:L.LineSeries,s.type==='candle'&&this.mode==='candle'?{upColor:'#ff4848',downColor:'#4b85ff',borderUpColor:'#ff4848',borderDownColor:'#4b85ff',wickUpColor:'#ff6464',wickDownColor:'#709fff',priceScaleId:s.axis,lastValueVisible:true,priceLineVisible:true,priceFormat:{type:'custom',formatter:v=>number(v),minMove:.0001}}:{color:s.color||'#eeeeee',lineWidth:1,priceScaleId:s.axis,lastValueVisible:true,priceLineVisible:true,priceFormat:s.format==='percent'?{type:'custom',formatter:v=>(v*100).toFixed(2)+'%'}:{type:'custom',formatter:v=>number(v),minMove:.0001}});
   api.setData(sourceData(s,this.mode,this.model.timeline));if(this.model.zero){api.applyOptions({autoscaleInfoProvider:base=>zeroAutoscale(base())});api.createPriceLine({price:0,color:'#777777',lineWidth:1,lineStyle:L.LineStyle.Dashed,axisLabelVisible:true,title:'ZERO'});}this.series.push(api);
   if(s.type==='candle'){
    const volume=this.chart.addSeries(L.HistogramSeries,{priceFormat:{type:'volume'},priceLineVisible:false,lastValueVisible:true},1);
    volume.setData(s.points.map(p=>({time:p.time/1000,...(p.volume==null?{}:{value:p.volume,color:p.close>=p.open?'#a54c4c':'#3c5d9d'})})));
    for(const period of this.state.studies||[]){const colors={5:'#ffffff',20:'#ff40d0',60:'#43d683'},ma=this.chart.addSeries(L.LineSeries,{color:colors[period]||'#ffe000',lineWidth:1,priceLineVisible:false,lastValueVisible:true,title:'MA '+period});ma.setData(movingAverage(s.points,period))}
   }
  }
 }
 quote(time){if(time==null){this.readout.textContent='NO SOURCE BARS · No synthetic candles are generated.';return}
  const rows=[`<span class="quote-time">${esc(sourceClock(this.model,time))}</span>`];let tip='';
  for(const s of this.model.series){const p=s.byTime.get(time);if(!p)continue;
   if(s.type==='candle'){rows.push(...[['O',p.open],['H',p.high],['L',p.low],['C',p.close],['VOL',p.volume]].map(([k,v])=>`<span>${k} <b>${esc(number(v))}</b></span>`));tip+=`<b>${esc(s.label||s.id)}</b><dl>${[['OPEN',p.open],['HIGH',p.high],['LOW',p.low],['CLOSE',p.close],['VOLUME',p.volume]].map(([k,v])=>`<dt>${k}</dt><dd>${esc(number(v))}</dd>`).join('')}</dl>`}
   else rows.push(`<span>${esc(s.label||s.id)} <b>${esc(s.format==='percent'&&Number.isFinite(p.value)?(p.value*100).toFixed(3)+'%':number(p.value))}</b> ${esc(s.unit)}</span>`)
  }
  this.readout.innerHTML=rows.join('');this.tooltip.innerHTML=`<span>${esc(sourceClock(this.model,time))}</span>${tip}`;
 }
 range(count){const length=this.model.timeline.length;if(!length)return;this.state.followLast=true;this.state.rangeCount=count;const n=count==='all'?length:Math.min(length,Number(count)||60);this.chart.timeScale().setVisibleLogicalRange({from:Math.max(0,length-n)-.5,to:length+2});for(const b of this.root.querySelectorAll('[data-native-range]'))b.classList.toggle('active',String(count)===b.dataset.nativeRange)}
 rebuild(){const options=this.options;this.setData(options)}
 cleanup(){for(const off of this.cleanups.splice(0))off();this.observer?.disconnect();if(this.chart){if(this.onCross)this.chart.unsubscribeCrosshairMove(this.onCross);if(this.onRange)this.chart.timeScale().unsubscribeVisibleTimeRangeChange(this.onRange);this.chart.remove();this.chart=null}this.series=[];this.size=null}
 dispose(){if(this.disposed)return;this.disposed=true;this.generation++;this.cleanup();this.root.replaceChildren()}
}
