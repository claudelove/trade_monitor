import {eventStudy,runBacktest} from './analytics.js';
const cache=new Map();
async function snapshot(mode){
 if(!['live','demo'].includes(mode))throw Error('데이터 모드를 확인하세요.');
 if(!cache.has(mode))cache.set(mode,fetch(new URL('./data/'+mode+'.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('스냅샷 파일을 불러올 수 없습니다.');return r.json()}).catch(error=>{cache.delete(mode);throw error}));
 return structuredClone(await cache.get(mode));
}
export async function api(path,body){
 const url=new URL(path,'https://catalyst.invalid'),mode=body?.mode||url.searchParams.get('mode')||'live';
 if(url.pathname==='/api/snapshot')return snapshot(mode);
 if(url.pathname==='/api/backtest'){
  const data=await snapshot(mode);if(!data.strategies[body.strategy||'buyback'])throw Error('전략을 확인하세요.');
  return runBacktest(data,body);
 }
 const match=url.pathname.match(/^\/api\/event\/([^/]+)$/);
 if(match){const data=await snapshot(mode),event=data.events.find(e=>e.id===decodeURIComponent(match[1]));if(!event)throw Error('이벤트 없음');return {event,study:eventStudy(event,data.prices,url.searchParams.get('benchmark')||'069500')}}
 throw Error('GitHub Pages에서는 데이터 수집을 GitHub Actions에서 실행하세요.');
}
