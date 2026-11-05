// Public preview boundary. Never route a Pages request to a private engine.
let snapshot;
const copy=value=>structuredClone(value);
export const previewMessage='Public UI preview: connect the protected engine to use this function. No private engine is connected.';
async function market(){
 if(!snapshot){const response=await fetch(new URL('./data/live.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Public market snapshot unavailable');const value=await response.json();snapshot={...value,version:'public-snapshot:'+value.as_of,mode:'public_snapshot',scope:'Public market snapshot; canonical revision/availability clocks unavailable',price_label:'NAVER adjusted daily bars / not live KRX',symbols:Object.keys(value.prices)};}
 return copy(snapshot);
}
export async function previewRead(path,{signal}={}){
 signal?.throwIfAborted();const url=new URL(path,'https://preview.invalid'),p=url.pathname;
 if(p==='/api/accounts'||p==='/api/runs')return [];
 if(p==='/api/health')return {role:'public_preview'};
 if(p==='/api/monitor/snapshot')return market();
 if(p.startsWith('/api/data/events/')){
  const data=await market(),id=decodeURIComponent(p.slice('/api/data/events/'.length)),record=[...data.events,...data.news].find(e=>String(e.id)===id);if(!record)throw Error('Event not in the public snapshot.');
  return {event:{kind:data.events.includes(record)?'DISCLOSURE':'NEWS',source:record.source||record.publisher,source_event_id:record.id,symbol:record.ticker,occurred_at:null,received_at:null,available_at:null,time_quality:'PUBLIC_SNAPSHOT / AVAILABILITY CLOCKS UNAVAILABLE',revision:null,payload:{...record}},projection:'Public snapshot record; not a canonical engine event or revision journal.'};
 }
 if(p==='/api/strategy-lab/code-drafts')return [];
 if(p==='/api/strategy-lab/catalog')return {datasets:[],registered_python:[],template:'',registry_error:previewMessage};
 if(p==='/api/paper/profiles'||p==='/api/analysis/tools')return [];
 throw Error(previewMessage);
}
export function previewOperation(){throw Error(previewMessage+' Server operations are disabled on GitHub Pages.');}
