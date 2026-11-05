// Exact display adapter for schema-declared decimal strings (prices, never IDs).
// Keep the shared number formatter strict; no Number/parseFloat rounding here.
export function formatDecimal(value,{missing='—'}={}){
 if(typeof value!=='string'||value.length>128)return missing;
 const match=/^([+-]?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d{1,3}))?$/.exec(value);
 if(!match)return missing;
 const exponent=match[4]===undefined?0:parseInt(match[4],10);
 if(Math.abs(exponent)>100)return missing;
 const digits=match[2]+(match[3]||''),point=match[2].length+exponent;
 let whole,fraction;
 if(point<=0){whole='0';fraction='0'.repeat(-point)+digits}
 else if(point>=digits.length){whole=digits+'0'.repeat(point-digits.length);fraction=''}
 else{whole=digits.slice(0,point);fraction=digits.slice(point)}
 whole=whole.replace(/^0+(?=\d)/,'');
 const negative=match[1]==='-'&&/[1-9]/.test(whole+fraction);
 return (negative?'-':'')+whole.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(fraction?'.'+fraction:'');
}
