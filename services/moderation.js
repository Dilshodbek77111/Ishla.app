const banned=['casino','kazino','narkotik','drugs','weapon','qurol','terrorism','terrorizm','porn','prostitution','fohishalik','наркотик','оружие','терроризм','порн','проституц'];
function normalize(s){return String(s||'').toLowerCase().normalize('NFKC').replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim()}
function moderate(...parts){const text=normalize(parts.join(' ')); const hit=banned.find(k=>text.includes(k)); return hit?{blocked:true,reason:`Prohibited content keyword: ${hit}`}:{blocked:false}}
module.exports={normalize,moderate};
