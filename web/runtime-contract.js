// Minimal JSON Schema evaluator for this versioned Pydantic contract.
// Unknown schema keywords are not used by strategy-runtime-v1.json.
export function validateBundle(value,contract){
 const root=contract.bundle_schema;
 function check(data,s,path){
  if(s.$ref){const keys=s.$ref.slice(2).split('/');let ref=root;for(const key of keys)ref=ref[key];return check(data,ref,path)}
  if(s.anyOf){for(const option of s.anyOf){try{check(data,option,path);return}catch{}}throw Error(path+': 값 형식 오류')}
  if(s.const!==undefined&&data!==s.const)throw Error(path+': 버전 오류');
  if(s.enum&&!s.enum.includes(data))throw Error(path+': 지원하지 않는 값');
  const type=data===null?'null':Array.isArray(data)?'array':typeof data;
  if(s.type&&!(s.type==='integer'?Number.isInteger(data):s.type==='number'?typeof data==='number':s.type===type))throw Error(path+': '+s.type+' 필요');
  if(typeof data==='number'){
   if(!Number.isFinite(data)||s.minimum!==undefined&&data<s.minimum||s.maximum!==undefined&&data>s.maximum||s.exclusiveMinimum!==undefined&&data<=s.exclusiveMinimum)throw Error(path+': 숫자 범위 오류');
  }
  if(typeof data==='string'){
   if(s.minLength!==undefined&&data.length<s.minLength||s.maxLength!==undefined&&data.length>s.maxLength||s.pattern&&!new RegExp(s.pattern).test(data))throw Error(path+': 문자열 형식 오류');
   if(s.format==='date-time'&&(!/(Z|[+-]\d\d:\d\d)$/.test(data)||!Number.isFinite(Date.parse(data))))throw Error(path+': 시간대 포함 시각 필요');
  }
  if(Array.isArray(data)){
   if(s.maxItems!==undefined&&data.length>s.maxItems)throw Error(path+': 항목이 너무 많습니다');
   data.forEach((item,i)=>check(item,s.items,path+'['+i+']'));
  }else if(data!==null&&typeof data==='object'){
   for(const key of s.required||[])if(!(key in data))throw Error(path+'.'+key+': 필수 항목');
   for(const key of Object.keys(data)){
    if(!Object.hasOwn(s.properties||{},key)){if(s.additionalProperties===false)throw Error(path+'.'+key+': 정의되지 않은 항목');continue}
    check(data[key],s.properties[key],path+'.'+key);
   }
  }
 }
 check(value,root,'bundle');
 const artifacts=new Map();
 for(const a of value.strategies||[]){const key=a.strategy_id+'@'+a.version;if(artifacts.has(key)&&JSON.stringify(artifacts.get(key))!==JSON.stringify(a))throw Error('동일 전략 버전 충돌');artifacts.set(key,a)}
 const latest=new Map(),seen=new Map();
 for(const run of value.runs||[]){
  const artifact=artifacts.get(run.strategy_id+'@'+run.strategy_version);
  if(!artifact||artifact.code_sha256!==run.code_sha256)throw Error('실행 결과의 코드/전략 버전을 확인하세요.');
  if(seen.has(run.snapshot_id)){if(JSON.stringify(seen.get(run.snapshot_id))!==JSON.stringify(run))throw Error('snapshot_id 충돌');continue}seen.set(run.snapshot_id,run);
  const previous=latest.get(run.run_id);
  if(previous&&(previous.strategy_id!==run.strategy_id||previous.strategy_version!==run.strategy_version||previous.code_sha256!==run.code_sha256||previous.mode!==run.mode||run.sequence<=previous.sequence||Date.parse(run.as_of)<Date.parse(previous.as_of)))throw Error('실행 식별자 또는 상태 순서 충돌');
  latest.set(run.run_id,run);
 }
 return {schema_version:'1.0',strategies:[...artifacts.values()],runs:[...latest.values()].sort((a,b)=>Date.parse(b.as_of)-Date.parse(a.as_of)),execution_control:'external_runtime',execution_adapter:'not_connected',transport:'local_file'};
}
