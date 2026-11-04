const cache=new Map();
async function snapshot(mode){
 if(!['live','demo'].includes(mode))throw Error('데이터 모드를 확인하세요.');
 if(!cache.has(mode))cache.set(mode,fetch(new URL('./data/'+mode+'.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('스냅샷 파일을 불러올 수 없습니다.');return r.json()}).catch(error=>{cache.delete(mode);throw error}));
 return structuredClone(await cache.get(mode));
}
export async function api(path,body){
 const url=new URL(path,'https://catalyst.invalid'),mode=body?.mode||url.searchParams.get('mode')||'live';
 if(url.pathname==='/api/snapshot')return snapshot(mode);
 if(url.pathname==='/api/backtest')throw Error('내장 전략 실행은 종료했습니다. 외부 실행 결과를 연결하세요.');
 if(url.pathname==='/api/runtime/state'||url.pathname==='/api/runtime/contract'||url.pathname==='/api/runtime/example'){const name=url.pathname.endsWith('state')?'runtime-state.json':url.pathname.endsWith('example')?'runtime-example.json':'runtime-contract.json';const response=await fetch(new URL('./data/'+name,import.meta.url));if(!response.ok)throw Error('연동 규격 파일을 읽을 수 없습니다.');return response.json()}
 const match=url.pathname.match(/^\/api\/event\/([^/]+)$/);
 if(match){const data=await snapshot(mode),event=data.events.find(e=>e.id===decodeURIComponent(match[1]));if(!event)throw Error('이벤트 없음');return {event}}
 throw Error('GitHub Pages에서는 데이터 수집을 GitHub Actions에서 실행하세요.');
}
