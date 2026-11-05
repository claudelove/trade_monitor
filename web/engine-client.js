import {previewRead,previewOperation} from './pages-preview.js';
const isPreview=()=>globalThis.document?.documentElement?.dataset.hosting==='pages';
// Only same-origin reads. No public host fallback, credential input, or strategy execution.
import {parseNativeReport} from './native-report.js';
export async function api(path,{signal}={}){
  if(typeof path!=='string'||!path.startsWith('/api/')||path.startsWith('//'))throw Error('Only same-origin terminal APIs are allowed.');
  if(isPreview())return previewRead(path,{signal});
  const response=await fetch(path,{signal,cache:'no-store',credentials:'same-origin',redirect:'error'});
  if(!response.ok){let detail;try{detail=(await response.json()).error}catch{}
    throw Error(`${response.status===403?'Check the authorized source IP and host':detail||'Query failed'} (${response.status})`)}
  return response.json();
}
const operations=new Set(['/api/v1/data/history','/api/v1/data/recording/review','/api/v1/data/recording/disable','/api/strategy-lab/code-validate','/api/strategy-lab/backtest','/api/strategy-lab/code-drafts','/api/access/rotate','/api/strategy-lab/validate','/api/strategy-lab/drafts','/api/strategy-lab/run','/api/strategy-lab/run-python','/api/analysis/run','/api/paper/jobs']);
export async function operation(path,body,{signal}={}){
  if(isPreview())return previewOperation();
  if(!operations.has(path)&&!/^\/api\/paper\/jobs\/[a-f0-9]{32}\/stop$/.test(path))throw Error('Operation is not in the terminal allowlist');
  const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal,cache:'no-store',credentials:'same-origin',redirect:'error'});
  const value=await response.json();if(!response.ok)throw Error(value.error||'Operation failed');return value;
}
export class EngineClient{
  constructor(request=api){this.request=request;this.generation=0;this.controller=null;this.selected=null;}
  cancel(){this.generation++;this.controller?.abort();}
  async load(selection=this.selected){
    this.cancel();const generation=this.generation,controller=new AbortController();this.controller=controller;
    const get=path=>this.request(path,{signal:controller.signal});
    try {
    const [accounts,runs,market]=await Promise.all([get('/api/accounts'),get('/api/runs'),get('/api/monitor/snapshot').then(data=>({data,error:null})).catch(error=>{if(error.name==='AbortError')throw error;return {data:null,error:error.message}})]);
    const data=market.data;
    if(generation!==this.generation)return null;
    const choices=[...accounts.map(a=>({key:'account:'+a.id,label:a.name+' / '+a.status+' / '+(a.updated_at||a.id.slice(0,8)),kind:'account',id:a.id})),
      ...runs.filter(r=>!r.account_id).map(r=>({key:'run:'+r.id,label:r.strategy+' / '+r.created,kind:'run',id:r.id}))];
    const selected=selection||choices[0]?.key||null;
    let report=null;
    if(selected){const [kind,...parts]=selected.split(':');const id=parts.join(':');
      if(!['account','run'].includes(kind)||!id)throw Error('Invalid account/run selection.');
      report=parseNativeReport(await get(`/api/${kind==='account'?'accounts':'runs'}/${encodeURIComponent(id)}`));
      report.transport='same_origin_engine_api';
      if(!choices.some(c=>c.key===selected))choices.push({key:selected,label:report.account?.name||report.runs[0]?.summary.strategy||id,kind,id});
    }
    if(generation!==this.generation)return null;
    this.selected=selected;
    return {choices,selected,report,data,marketError:market.error,accounts};
    }catch(error){if(generation!==this.generation)return null;throw error}
  }
}
