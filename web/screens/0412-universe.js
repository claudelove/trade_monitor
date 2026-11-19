import {esc,listen} from '../ui/dom.js';
import {renderTable} from '../shared/ui/table.js';
import {formatDecimal} from '../ui/exact-decimal.js';
const defaults={name:'Domestic equity universe',markets:['KOSPI','KOSDAQ'],top_n:100,minimum_listing_days:0,exclude_halted:true,exclude_preferred:true};
export default {
 id:'universe-settings',number:'0412',command:'UNIV',aliases:['UNIVERSE'],desk:'analysis',title:'Universe Code',
 render(ctx,pane={}){return `<div class="function-actions"><b>DEFAULT UNIVERSE / CODE</b><button data-univ-master>UPDATE MASTER</button><button data-univ-preview>PREVIEW</button><button data-univ-save>SAVE REVIEWED RULE</button><button data-univ-load hidden>LOAD SAVED RULE</button></div><p class="section-note">One default investment pool. Edit the JSON rule; future research resolves members automatically. Existing jobs keep their pinned membership. No orders.</p><div data-univ-status role="status" aria-busy="true">Loading saved rule…</div><textarea class="source-editor" data-univ-code aria-label="Universe rule code" rows="14" spellcheck="false">${esc(pane.ruleCode||'')}</textarea><div data-univ-summary></div><div data-univ-members></div>`},
 mount(root,ctx,pane={}){
  const q=s=>root.querySelector(s),code=q('[data-univ-code]'),status=q('[data-univ-status]');let disposed=false,busy=false,available=false,loading=false,settings=null,ruleId=null,base=null,defaultGeneration=null;
  const controls=()=>{for(const s of ['[data-univ-master]','[data-univ-preview]','[data-univ-save]'])q(s).disabled=busy||!available;q('[data-univ-load]').hidden=!pane.ruleDirty&&!pane.ruleStale;q('[data-univ-load]').disabled=busy};
  const read=()=>{const value=JSON.parse(code.value);if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!Object.hasOwn(defaults,k)))throw Error('Use only the displayed universe fields');return {id:ruleId,...value}};
  const say=t=>{if(!disposed)status.textContent=t};
  async function query(force=false){if(loading)return;loading=true;
   try{const value=await ctx.actions.api('/api/v1/universes/settings',{signal:ctx.signal});if(disposed)return;settings=value;available=true;
    const current=value.rules.find(r=>r.id===value.default.id);
    if(pane.ruleCode===undefined||force){ruleId=current?.id||'main';base=current?.revision||null;defaultGeneration=value.default.generation;
     const body={...defaults};for(const key of Object.keys(defaults))if(current&&key in current)body[key]=current[key];code.value=pane.ruleCode=JSON.stringify(body,null,2);pane.ruleDirty=false;pane.ruleStale=false;pane.ruleBase={ruleId,base,defaultGeneration};
    }else{({ruleId,base,defaultGeneration}=pane.ruleBase||{ruleId:current?.id||'main',base:current?.revision||null,defaultGeneration:value.default.generation});pane.ruleStale=base!==(current?.revision||null)||defaultGeneration!==value.default.generation}
    say(`MASTER ${value.master?.available_at||'NOT LOADED'} · UPDATE ${value.refresh?.status||'NOT REQUESTED'}${pane.ruleStale?' · SAVED RULE CHANGED — load and review before saving.':''}`);
   }catch(error){available=false;say('UNIVERSE UNAVAILABLE · '+error.message)}finally{loading=false;if(!disposed){status.setAttribute('aria-busy','false');controls()}}
  }
  async function operation(action){if(busy||!available)return;busy=true;controls();status.setAttribute('aria-busy','true');const source=code.value;
   try{
    if(action==='master'){await ctx.actions.operation('/api/v1/universes/refresh-master',{request_id:crypto.randomUUID().replaceAll('-','')},{signal:ctx.signal});say('Master update requested. Existing rule is unchanged.');return}
    const rule=read();
    if(action==='preview'){
     const result=await ctx.actions.operation('/api/v1/universes/preview',{rule,evaluation_date:new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'})},{signal:ctx.signal});if(disposed||code.value!==source)return;
     q('[data-univ-summary]').textContent=`${result.members.length} members / ${result.eligible_count} eligible · ${result.source} · AVAILABLE ${result.master_available_at} · SOURCE DATE ${result.market_date||'UNVERIFIED'}`;
     q('[data-univ-members]').innerHTML=renderTable({columns:[{key:'rank',label:'RANK',type:'number'},{key:'symbol',label:'TICKER'},{key:'name',label:'SECURITY'},{key:'market',label:'MARKET'},{key:'capital',label:'REFERENCE CAP / KRW',align:'right'}],rows:result.members.map(r=>({...r,capital:formatDecimal(r.market_cap_krw)}))});say('Preview only. Review the rule before saving.');
    }else{
     if(pane.ruleStale)throw Error('Saved rule changed; load the current rule first');
     const result=await ctx.actions.operation('/api/v1/universes/settings',{rule,expected_revision:base,make_default:true,expected_default_generation:defaultGeneration},{signal:ctx.signal});if(disposed)return;
     ruleId=result.id;base=result.revision;defaultGeneration=result.default.generation;pane.ruleBase={ruleId,base,defaultGeneration};if(code.value===source){pane.ruleDirty=false;pane.ruleStale=false}say('Saved default universe. Existing research is unchanged.');
    }
   }catch(error){say('REQUEST BLOCKED · '+error.message)}finally{busy=false;if(!disposed){status.setAttribute('aria-busy','false');controls()}}
  }
  const off=[listen(code,'input',()=>{pane.ruleCode=code.value;pane.ruleDirty=true;q('[data-univ-summary]').textContent='';q('[data-univ-members]').replaceChildren();controls()}),listen(q('[data-univ-master]'),'click',()=>operation('master')),listen(q('[data-univ-preview]'),'click',()=>operation('preview')),listen(q('[data-univ-save]'),'click',()=>operation('save')),listen(q('[data-univ-load]'),'click',()=>{if(pane.ruleDirty&&!root.ownerDocument.defaultView.confirm('Discard unsaved universe code?'))return;query(true)})];
  controls();query();const timer=setInterval(()=>{if(!busy)query()},10000);return()=>{disposed=true;clearInterval(timer);off.forEach(f=>f())};
 }
};
