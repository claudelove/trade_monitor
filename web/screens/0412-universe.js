import {esc,listen} from '../ui/dom.js';
import {renderTable} from '../shared/ui/table.js';
import {formatDecimal as formatExactDecimal} from '../ui/exact-decimal.js';

export default {
 id:'universe-settings',number:'0412',command:'UNIV',aliases:['UNIVERSE'],desk:'analysis',title:'Universe Settings',
 render(){return `<div class="function-actions"><b>INVESTABLE UNIVERSES</b><button data-univ-refresh>RELOAD SETTINGS</button></div><p class="section-note">Save the common pool once. CODE selects members and historical inputs automatically from research conditions. Current market-cap constituents are not historical point-in-time membership. RELOAD SETTINGS loads the selected saved rule and replaces draft edits.</p><div data-univ-status role="status">Loading protected universe settings…</div><div class="management-form"><label>SAVED RULE<select data-univ-select><option value="">NEW RULE</option></select></label><button data-univ-load>LOAD RULE</button><button data-univ-master>REFRESH OFFICIAL MASTER</button></div><fieldset data-univ-controls disabled><legend>UNIVERSE RULE / REFERENCE MARKET CAPITALIZATION</legend><form data-univ-form class="management-form"><label>ID<input name="id" value="main" required pattern="[A-Za-z][A-Za-z0-9_-]{0,63}"></label><label>NAME<input name="name" value="Domestic equity universe" required maxlength="120"></label><label>MARKET<select name="market"><option value="BOTH">KOSPI + KOSDAQ</option><option value="KOSPI">KOSPI</option><option value="KOSDAQ">KOSDAQ</option></select></label><label>TOP N<input name="top_n" type="number" min="1" max="100" value="100" required></label><label>MIN LISTED DAYS<input name="minimum_listing_days" type="number" min="0" max="36500" value="0" required></label><label><span>EXCLUDE HALTED</span><input name="exclude_halted" type="checkbox" checked></label><label><span>EXCLUDE PREFERRED</span><input name="exclude_preferred" type="checkbox" checked></label><label><span>USE AS DEFAULT</span><input name="make_default" type="checkbox" checked></label><button type="button" data-univ-preview>PREVIEW MEMBERS</button><button>SAVE RULE</button></form></fieldset><div data-univ-summary class="section-note"></div><div data-univ-members></div><p class="section-note">Ranking: provider reference capitalization descending, then ticker for ties. Ordinary domestic shares only. Source date is not invented from download time. Saving affects future research; existing reviewed jobs retain their pinned universe. No broker order is sent.</p>`},
 mount(root,ctx){
  const q=s=>root.querySelector(s),f=q('[data-univ-form]'),status=q('[data-univ-status]'),select=q('[data-univ-select]');
  let settings=null,disposed=false,busy=false,loading=false,sequence=0,loaded=null,defaultGeneration=null,available=false;
  const read=()=>({id:f.elements.id.value,name:f.elements.name.value,markets:f.elements.market.value==='BOTH'?['KOSPI','KOSDAQ']:[f.elements.market.value],top_n:Number(f.elements.top_n.value),minimum_listing_days:Number(f.elements.minimum_listing_days.value),exclude_halted:f.elements.exclude_halted.checked,exclude_preferred:f.elements.exclude_preferred.checked});
  const controls=()=>{
   q('[data-univ-controls]').disabled=busy||!available;
   for(const selector of ['[data-univ-load]','[data-univ-master]'])q(selector).disabled=busy||!available;
   select.disabled=busy||!available;q('[data-univ-refresh]').disabled=busy;
  };
  const clearPreview=()=>{q('[data-univ-summary]').textContent='';q('[data-univ-members]').replaceChildren()};
  const describe=()=>{
   if(!settings)return;
   const changed=loaded&&settings.rules.find(r=>r.id===loaded.id)?.revision!==loaded.revision;
   const defaultChanged=defaultGeneration!==settings.default.generation;
   status.textContent=`DEFAULT ${settings.default.id||'NOT SET'} · MASTER ${settings.master?settings.master.available_at:'NOT LOADED'} · REFRESH ${settings.refresh?.status||'NOT REQUESTED'} · KIS HISTORY ${settings.history_environment?.toUpperCase()||'UNSPECIFIED'} / ${settings.history_credentials_configured?'KEYS PRESENT / NOT A CONNECTION TEST':settings.history_credential_status==='incomplete'?'INCOMPLETE KEY PAIR':'KEYS MISSING'}${changed||defaultChanged?' · SAVED SETTINGS CHANGED: reload and review before saving.':''}`;
  };
  const loadRule=rule=>{
   loaded=rule||null;defaultGeneration=settings.default.generation;
   if(!rule){f.reset();f.elements.make_default.checked=true;clearPreview();return}
   for(const key of ['id','name','top_n','minimum_listing_days'])f.elements[key].value=rule[key];
   f.elements.market.value=rule.markets.length===2?'BOTH':rule.markets[0];
   for(const key of ['exclude_halted','exclude_preferred'])f.elements[key].checked=rule[key];
   f.elements.make_default.checked=settings.default.id===rule.id;clearPreview();
  };
  const query=async(mode='poll')=>{
   const token=++sequence;loading=true;
   if(mode==='reload'){busy=true;controls()}
   try{
    const value=await ctx.actions.api('/api/v1/universes/settings',{signal:ctx.signal});
    if(disposed||ctx.signal?.aborted||token!==sequence)return false;
    const selected=select.value;settings=value;available=true;
    select.innerHTML='<option value="">NEW RULE</option>'+value.rules.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}${r.id===value.default.id?' / DEFAULT':''}</option>`).join('');
    select.value=value.rules.some(r=>r.id===selected)?selected:'';
    if(mode==='initial'){
     const rule=value.rules.find(r=>r.id===value.default.id);select.value=rule?.id||'';loadRule(rule);
    }else if(mode==='reload')loadRule(value.rules.find(r=>r.id===select.value));
    describe();return true;
   }catch(error){if(!disposed&&token===sequence){available=false;status.textContent='UNIVERSE SERVICE UNAVAILABLE · '+error.message}return false}
   finally{if(!disposed&&token===sequence){loading=false;if(mode==='reload')busy=false;controls()}}
  };
  const post=async(path,body)=>{
   if(busy||!available)return null;busy=true;controls();
   try{return await ctx.actions.operation('/api/v1/universes/'+path,body,{signal:ctx.signal})}
   catch(error){if(!disposed)status.textContent='REQUEST FAILED · '+error.message;return null}
   finally{busy=false;if(!disposed)controls()}
  };
  const preview=async()=>{
   if(!f.reportValidity())return;
   const snapshot=JSON.stringify(read()),day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
   const result=await post('preview',{rule:JSON.parse(snapshot),evaluation_date:day});
   if(!result||disposed||snapshot!==JSON.stringify(read()))return;
   q('[data-univ-summary]').textContent=`${result.members.length} selected / ${result.eligible_count} eligible · SOURCE ${result.source} · AVAILABLE ${result.master_available_at} · DATE ${result.market_date||'REFERENCE DATE UNVERIFIED'} · SNAPSHOT ${result.snapshot_id}`;
   q('[data-univ-members]').innerHTML=renderTable({columns:[{key:'rank',label:'RANK',type:'number',digits:0},{key:'symbol',label:'TICKER'},{key:'name',label:'SECURITY'},{key:'market',label:'MARKET'},{key:'capital',label:'REFERENCE CAP / KRW',align:'right'},{key:'listing_date',label:'LISTED'},{key:'lot_size',label:'LOT',type:'number',digits:0}],rows:result.members.map(r=>({...r,capital:formatExactDecimal(r.market_cap_krw)}))});
  };
  const off=[
   listen(q('[data-univ-refresh]'),'click',()=>query('reload')),
   listen(q('[data-univ-load]'),'click',()=>{if(!settings)return;loadRule(settings.rules.find(r=>r.id===select.value));describe()}),
   listen(q('[data-univ-master]'),'click',async()=>{const result=await post('refresh-master',{request_id:crypto.randomUUID().replaceAll('-','')});if(result&&!disposed){await query();status.textContent='Master refresh queued. The universe worker preserves source evidence.'}}),
   listen(q('[data-univ-preview]'),'click',preview),listen(f,'input',clearPreview),listen(f,'change',clearPreview),
   listen(f,'submit',async event=>{
    event.preventDefault();if(!settings||!f.reportValidity())return;
    const rule=read();
    const result=await post('settings',{rule,expected_revision:loaded?.id===rule.id?loaded.revision:null,make_default:f.elements.make_default.checked,expected_default_generation:defaultGeneration});
    if(result&&!disposed){loaded=result;defaultGeneration=result.default.generation;await query();select.value=result.id;status.textContent='SAVED · '+result.id+' / '+result.revision+' · Future jobs use this rule; reviewed jobs stay pinned.'}
   })
  ];
  controls();query('initial');const timer=setInterval(()=>{if(!busy&&!loading)query()},10000);
  return()=>{disposed=true;++sequence;clearInterval(timer);off.forEach(f=>f())};
 }
};
