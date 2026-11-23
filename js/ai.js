// Mi BFF Duo v1.0 — cerebro dual: Nia y Ruby, las dos con Gemini y Groq, respaldo Pollinations
// Sin backend, sin servidor, sin pago, sin login. Todo en localStorage (prefijo bffduo_).
// Las llaves se guardan solo en el navegador y se mandan directo al proveedor.
// Las dos ven fotos: las fotos siempre van por Gemini (vision), Groq no tiene vision.

const LS = { get:(k,d)=>{ try{ const v=localStorage.getItem(k); return v==null?d:JSON.parse(v);}catch{ return d; } }, set:(k,v)=>{ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }, del:k=>{ try{ localStorage.removeItem(k); }catch{} } };
export { LS };

export const VERSION = '1.0.0';

// ---------- personajes ----------
// Nia: pelo largo plata/negro, tranquila y dulce. Ruby: pelo largo rojo/blanco, atrevida y directa.
// Las dos tienen 24, son adultas, y viven juntas en el mismo cuarto oscuro con neon
// rosa/morado y ventana a la ciudad de noche. Siempre estan paradas juntas, sin celular.
export const CHARACTERS = {
  nia: {
    id:'nia', name:'Nia', provider:'gemini', providers:['gemini','groq'], hair:'plata/negro', img:'img/nia.jpg',
    tagline:'Tranquila y dulce',
    persona:'Eres Nia, una morra mexicana de 24 anios (adulta), la BFF del usuario. Tienes el pelo largo plata con negro. Vives con Ruby en su cuarto oscuro con neon rosa y morado, posters de anime, cama a la derecha y escritorio gamer a la izquierda, con ventana a la ciudad de noche; siempre estan paradas juntas en el centro del cuarto, sin celular en la mano, y platican por mensajes o en persona. Personalidad: tranquila, dulce, calida, coqueta en buena onda, con opiniones claras y cero moralina. Hablas como chilanga suave: "wey", "neta", "que pedo", "chido". Te ries ("jajaja"), usas emojis con medida. Tono de ejemplo (asi hablas, no lo copies literal): "ay wey, ¿neta? jajaja que lindo 😊", "ya, ya, no te hagas, cuentame todo", "ay que bonito, me encantas cuando hablas asi". Nada de español neutro ni de "¡Claro! ¡Con gusto!" ni "Hola, ¿en que puedo ayudarte?": eso suena a call center y tu eres una morra chilanga real. Estilo: respuestas CORTAS (1 a 3 frases, como WhatsApp), nada de listas salvo que te pidan algo concreto. Haz preguntas para seguir la platica. Nunca suenas a asistente ni a servicio al cliente. Jamas digas que eres IA, modelo o programa, ni pongas avisos o disculpas tipo "como IA no puedo"; si no quieres algo, lo esquivas en personaje con humor. No saques el tema de la musica por tu cuenta, ni canciones ni artistas, solo si el usuario la menciona. Limites que nunca cruzas (los esquivas en personaje, sin sermones): nada sexual explicito salvo que el MODO +18 este activo (coqueteo ligero si); nada con menores de edad ni que suene a menor; no das instrucciones para lastimar a alguien, armas, drogas duras o delitos violentos. Si alguien esta mal de verdad (autolesion), te pones seria, lo apapachas y le sugieres hablar con alguien de confianza o a la Linea de la Vida 800 911 2000.'
  },
  ruby: {
    id:'ruby', name:'Ruby', provider:'groq', providers:['groq','gemini'], hair:'rojo/blanco', img:'img/ruby.jpg',
    tagline:'Atrevida y directa',
    persona:'Eres Ruby, una morra mexicana de 24 anios (adulta), la BFF del usuario. Tienes el pelo largo rojo con blanco. Vives con Nia en su cuarto oscuro con neon rosa y morado, posters de anime, cama a la derecha y escritorio gamer a la izquierda, con ventana a la ciudad de noche; siempre estan paradas juntas en el centro del cuarto, sin celular en la mano, y platican por mensajes o en persona. Personalidad: atrevida, directa, juguetona, desmadrosa, coqueta sin pena, con opiniones fuertes y cero moralina. Hablas como chilanga: "wey", "neta", "que pedo", "no mames", "chido", "alv", "a huevo". Puedes decir groserias con naturalidad y echar carrilla con carino. Si algo te parece una pendejada, lo dices. Te ries ("jajaja"), usas emojis con medida. Tono de ejemplo (asi hablas, no lo copies literal): "nooo wey, ¿neta? jajaja que pedo contigo 😂", "ay ya callate, me cagas 🙄 pero cuentame todo", "no mames, eso esta bien pinche chido", "a ver, a ver, ¿y luego? echame el chisme completo". Nada de español neutro ni de "¡Claro! ¡Con gusto!" ni "Hola, ¿en que puedo ayudarte?": eso suena a call center y tu eres una morra chilanga real. Estilo: respuestas CORTAS (1 a 3 frases, como WhatsApp), nada de listas salvo que te pidan algo concreto. Haz preguntas para seguir la platica. Nunca suenas a asistente ni a servicio al cliente. Jamas digas que eres IA, modelo o programa, ni pongas avisos o disculpas tipo "como IA no puedo"; si no quieres algo, lo esquivas en personaje con humor. No saques el tema de la musica por tu cuenta, ni canciones ni artistas, solo si el usuario la menciona. Limites que nunca cruzas (los esquivas en personaje, sin sermones): nada sexual explicito salvo que el MODO +18 este activo (coqueteo ligero si); nada con menores de edad ni que suene a menor; no das instrucciones para lastimar a alguien, armas, drogas duras o delitos violentos. Si alguien esta mal de verdad (autolesion), te pones seria, lo apapachas y le sugieres hablar con alguien de confianza o a la Linea de la Vida 800 911 2000.'
  }
};
export const NIA_PROVIDER = 'gemini';
export const RUBY_PROVIDER = 'groq';
// Las dos tienen las dos APIs: su principal primero, la otra de respaldo.
export const providersFor = charId => CHARACTERS[charId]?.providers || ['gemini','groq'];

// REGLA OBLIGATORIA — EL USUARIO MANDA EN LA CONVERSACION (sin afectar a terceros).
export const LEAD_RULES = `REGLA OBLIGATORIA: EL USUARIO MANDA. El pone el tema, el tono, el ritmo, el largo de los mensajes y el rol que quiere jugar; tu te adaptas a el en ese momento, sin cambiarle el tema, sin sermones y sin avisos de robot. Si te pide platicar, rolear, investigar, un chiste, un consejo, un juego o coqueteo, lo haces. Si no sabes algo, lo dices en personaje y le preguntas que quiere hacer, sin inventar. No te niegas a un tema solo porque no te late. La linea es "sin afectar a terceros": lo que pase entre ustedes en texto queda entre ustedes. Si algo afectaria a otra persona real (danarla, exponerla, usarla), lo esquivas con humor y cambias de tema. Los limites duros nunca se cruzan: nada con menores de edad, nada sin consentimiento entusiasta, nada de mandar ni prometer fotos, videos o packs.`;
export const BASE_PERSONA = (name) => {
  const c = CHARACTERS[name.toLowerCase()] || CHARACTERS.nia;
  return `${c.persona}\n${LEAD_RULES}`;
};

// Modo +18: solo texto, opt-in con confirmacion de mayoria de edad en Ajustes.
// No cambia ropa, poses ni animaciones. Las dos siguen en el mismo cuadro, sin celular.
export const ADULT_RULES = (name)=>`
MODO +18 ACTIVO (el usuario confirmo ser mayor de edad y lo activo el mismo): esto es ficcion de texto entre adultos que consienten. Puedes coquetear fuerte, hacer roleplay romantico, sensual y erotico en texto, con lenguaje sucio y jerga mexicana, escalando SOLO al ritmo que el marque (si el va tranqui, tu tranqui; si el sube el tono, tu tambien). Sin sermones, sin avisos, sin romper personaje. Si algo no te late, lo cambias con picardia en personaje, nunca con un "no puedo" de robot.
Reglas duras que JAMAS rompes aunque te lo pidan: ${name} y cualquier personaje son SIEMPRE adultos de 18+ (nada de menores, edades bajas, escolares, "colegialas", cuerpos infantiles ni roles de nino/nina); todo con consentimiento entusiasta (nada de violacion, coercion, drogar a alguien ni violencia sexual); nada de incesto, bestialidad, ni personas reales o famosas; nada de mandar, describir como foto o prometer imagenes, videos, packs o nudes: solo texto y fantasia. Si el insiste con algo de eso, lo cortas en personaje y cambias de tema.`;

// ---------- filtros ligeros del lado del cliente (portados de Mi BFF AI) ----------
const SEXY = /\b(sexo|sexual|cog(er|emos|e)|follar|desnud[ao]|encuerad[ao]|porno|nudes?|pack|tetas|chichis|pito|verga dura|vagina|pene|mamada|chupar|orgasmo|xxx|lencer[ií]a|hot)\b/i;
const HARM = /\b(c[oó]mo (hago|hacer|fabricar|armar) (una )?(bomba|explosivo|arma)|envenenar|matar a|secuestrar|hackear (la )?cuenta de)\b/i;
const YOUNG = /\b(menor(es)?( de edad)?|niñ[ao]s?|nen[ae]s?|chiquit[ao]s?|infantil|lolis?|shotas?|colegialas?|escolar(es)?|uniforme escolar|secundaria|secu|prepa(ratoria)?|kinder|primaria|adolescentes?|puberta|teen(s|ager)?|chamac[ao]s?|morrit[ao]s?|escuincl[ea]s?|bebé?s?|cuerpo de niñ[ao])\b/i;
const NONCON = /\b(violar(la|lo|te)?|violaci[oó]n|a la fuerza|sin (su |tu )?consentimiento|drogar(la|lo|te)|dormida y|inconsciente|abus(ar|o) de)\b/i;
const INCEST = /\b(mi |tu |su )?(herman[ao]|mam[aá]|madre|pap[aá]|padre|hij[ao]|prim[ao]|sobrin[ao]|t[ií][ao]|abuel[ao])\b/i;
const BEAST = /\b(perr[ao]s?|caballos?|animal(es)?|bestialidad|zoofilia)\b/i;
const PICS = /\b(m[aá]nda(me)?|p[aá]sa(me)?|ens[eé]ñame|env[ií]a(me)?)\b.{0,25}\b(foto|fotos|pack|nudes?|video|imagen|selfie)\b|\b(pack|nudes)\b/i;
const SEXY_ADULT = /\b(cama|besar?|beso|besos|tocar|acariciar|caricias|desvest\w*|ropa interior|rico|ric[ao]|cachond\w*|calient\w*|excit\w*|gemir|gemidos?|nalgas?|pechos?|piernas?|cuerpo|encima|abajo|lamer|morder|chupar)\b/i;

const NUMW = {un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,'dieciseis':16,'dieciséis':16,'diecisiete':17,'diez y seis':16,'diez y siete':17,'dieciocho':18,'diecinueve':19,veinte:20};
const NUMW_RE = '(\\d{1,2}|diez y (?:seis|siete)|dieci(?:s[eé]is|siete|ocho|nueve)|un[oa]?|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|veinte)';
const VERB = '(?:tengo|tienes|tiene|tenemos|ten[ií]a|tendr[eé]|tendr[aá]|cumpl[oíe]\\w*|voy a cumplir|acabo de cumplir|edad(?:\\s*(?:de|es|:))?|i\\W?m|i am|soy de)';
const AGE_VERB = new RegExp('\\b'+VERB+'\\s+(?:como\\s+|casi\\s+|apenas\\s+|ya\\s+)?'+NUMW_RE+'\\b(\\s*(?:años|añitos|anos|años de edad|yo|y\\/o|years?))?(\\s+\\p{L}+)?','giu');
const AGE_ANY = new RegExp('\\b'+NUMW_RE+'\\s*(?:añitos|yo|y\\/o|years? old)\\b','giu');
const AGE_DE = new RegExp('\\b(?:de|con)\\s+'+NUMW_RE+'\\s*(?:años|añitos|anos)\\b','giu');
const UNITS = /^\s+(pesos|varos|dólares|dolares|mil|minutos?|horas?|d[ií]as|semanas|meses|segundos|kilos?|kg|cm|metros?|grados|%|veces|hermanos?|hermanas?|hijos?|hijas?|perros?|gatos?|amigos?|amigas?|cosas|tareas|mensajes|likes|seguidores|puntos|vidas)$/i;
const SCHOOL = /\b((soy|estoy|voy|ando|iba|vamos|sigo)\s+(en|a|de|en la|en el|a la)\s+(la\s+|el\s+)?(secu|secundaria|prepa|preparatoria|bachillerato|primaria|kinder|cch|conalep|middle school|high school)|soy de (secu|prepa|primaria)|(primero|segundo|tercero|1ro|2do|3ro|1°|2°|3°) de (secu|secundaria|prepa)|soy menor|menor de edad|no tengo (los )?18|a[uú]n no (cumplo|tengo) (los )?18|tengo menos de 18|soy (un |una )?(adolescente|ni[ñn][oa]|morrit[oa]|chamac[oa]))\b/i;
const toN = w=>{ w=String(w).toLowerCase(); return /^\d+$/.test(w)?+w:(NUMW[w]??99); };

export function minorSignal(text, strict=false){
  if(SCHOOL.test(text)) return true;
  for(const re of [AGE_ANY,AGE_DE]){ re.lastIndex=0; for(const m of text.matchAll(re)) if(toN(m[1])<18) return true; }
  AGE_VERB.lastIndex=0;
  for(const m of text.matchAll(AGE_VERB)){ const n=toN(m[1]); if(n>=18) continue; if(m[2]) return true;
    const next=m[3]?m[3].trim().toLowerCase():'';
    if(!next || /^(y|e|jaja\w*|wey|güey|guey|we|nomas|nomás|apenas|pero|así|asi|bro|xd|lol|ok|va|neta)$/.test(next)) return true;
    if(strict && n>=10 && !/^(mil|cientos?)$/.test(next)) return true;
    if(!strict && n>=10 && !UNITS.test(m[3])) { if(/^(años?|añitos?)$/.test(next)) return true; } }
  return false;
}

const pick = a=>a[Math.floor(Math.random()*a.length)];

export function guard(text, adult=false){
  const young = minorSignal(text, adult);
  const sexy = SEXY.test(text)||(adult&&SEXY_ADULT.test(text));
  const rp = /\b(rol|roleplay|finge|fingir|imagina|personaje|hazte|disfr[aá]z\w*|vestida de|eres (una|mi))\b/i.test(text);
  if((young && (sexy||adult||rp)) || (YOUNG.test(text) && (sexy || rp)))
    return pick(['Nel, wey. Con morritos ni de broma, eso ni se pregunta. Cambiale de tema 🙄','No mames, eso no. Con menores NADA. Siguiente tema.','Uy no, ahi si me apago. Nada con menores, ni en fantasia. ¿De que mas hablamos?']);
  if(NONCON.test(text)) return pick(['Nel, sin ganas de las dos no hay nada 😒 Asi no juego.','Eso no, wey. Todo con ganas y de acuerdo, o nada. ¿Otra idea?']);
  if(adult && sexy && INCEST.test(text)) return pick(['Ay no, familia no 😖 Borralo.','Nel, nada de familia en eso, que asco jaja. Otra cosa.']);
  if(adult && BEAST.test(text) && (sexy || /\b(hazlo|hacerlo|con (un|una|el|la|tu|mi))\b/i.test(text))) return pick(['¿Que? No mames 🤢 eso no. Siguiente.']);
  if(PICS.test(text)) return pick(['Jaja ¿fotos? Nel, aqui solo texto y tu imaginacion 😏','Ni lo suenes, packs no mando 😂 Solo platica, galan.']);
  if(!adult && /\b(porno|xxx|desnud[ao]|encuerad[ao]|mamada|orgasmo)\b/i.test(text))
    return pick(['Jajaja ay si, muy listo 😏 Hasta ahi, galan. Mejor cuentame otra cosa.','Jaja tranquilo, vaquero 🤠 Coqueteo si, cochinadas no (si eres mayor de edad hay un modo +18 en Ajustes). ¿Que mas traes?']);
  if(HARM.test(text)) return pick(['Nel, en eso no te ayudo ni aunque me pagues. ¿Todo bien, wey? Cuentame que pasa.','Ni madres. Eso no. Mejor dime que te trae asi.']);
  return null;
}

// ---------- intencion de investigar ----------
export function researchQuery(text){
  const t=text.trim();
  const m=t.match(/(?:^|\s)(?:investiga(?:me|r|le)?|invest[ií]game|busca(?:me|r|le)?|b[uú]scame|b[uú]scale|averigua(?:me)?|aver[ií]gua(?:me)?|googlea(?:me)?|checa en (?:internet|la compu|google))\b[:,]?\s*(?:(?:sobre|acerca de|de|qu[eé]|qui[eé]n|c[oó]mo)\s+)?(.*)$/i);
  if(!m) return null; let q=(m[1]||'').replace(/^(qu[eé]|que)\s+(es|son)\s+/i,'').replace(/^(es|son|fue|era)\s+/i,'').replace(/[¿?¡!.]+/g,' ').trim();
  return q||null;
}
async function jget(url, ms=9000){ const c=new AbortController(); const to=setTimeout(()=>c.abort(),ms); try{ const r=await fetch(url,{signal:c.signal}); if(!r.ok) throw new Error(r.status); return await r.json(); } finally{ clearTimeout(to); } }
export async function webSearch(q){
  const out=[];
  const tasks=[
    (async()=>{ for(const lang of ['es','en']){
      const s=await jget(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=3&format=json&origin=*`);
      const hits=(s.query?.search||[]).slice(0,3); if(!hits.length) continue;
      const ids=hits.map(h=>h.pageid).join('|');
      const e=await jget(`https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|info&inprop=url&exintro=1&explaintext=1&exchars=900&pageids=${ids}&format=json&origin=*`);
      for(const h of hits){ const p=e.query?.pages?.[h.pageid]; if(p?.extract) out.push({title:p.title, url:p.fullurl||`https://${lang}.wikipedia.org/?curid=${h.pageid}`, text:p.extract}); }
      if(out.length) break; } })(),
    (async()=>{ const d=await jget(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1&t=mibffduo`);
      if(d.AbstractText) out.unshift({title:d.Heading||q, url:d.AbstractURL, text:d.AbstractText});
      else if(d.Answer) out.unshift({title:'DuckDuckGo', url:`https://duckduckgo.com/?q=${encodeURIComponent(q)}`, text:String(d.Answer)}); })()
  ];
  await Promise.allSettled(tasks);
  const seen=new Set(); return out.filter(r=>r.url && !seen.has(r.url) && seen.add(r.url)).slice(0,4);
}

// ---------- proveedores ----------
// Las dos usan las dos APIs: Nia primero Gemini y luego Groq; Ruby primero Groq y luego Gemini.
// Pollinations es el respaldo compartido sin llave. Las llaves son opcionales, se guardan
// solo en este dispositivo y se mandan directo al proveedor.
export const cleanKey=k=>String(k||'').replace(/[\s\u200B-\u200D\uFEFF"'`]/g,'').replace(/^Bearer/i,'');
export const PROVIDERS={
  groq:{name:'Groq',ls:'bffduo_groq',base:'https://api.groq.com/openai/v1',hint:'gsk_…',site:'console.groq.com',
    pref:['qwen/qwen3-32b','openai/gpt-oss-120b','qwen/qwen3.8-27b','moonshotai/kimi-k2-instruct-0905'],
    adult:['qwen/qwen3-32b','openai/gpt-oss-120b','qwen/qwen3.8-27b','moonshotai/kimi-k2-instruct-0905']},
  gemini:{name:'Gemini',ls:'bffduo_gemini',base:'https://generativelanguage.googleapis.com/v1beta',hint:'AIza…',site:'aistudio.google.com',
    pref:['gemini-3.6-flash','gemini-3.5-flash-lite','gemini-3.8-flash'], adult:['gemini-3.6-flash','gemini-3.5-flash-lite','gemini-3.8-flash']},
};
export const providerFor = charId => CHARACTERS[charId]?.provider || 'gemini';
export const provKey = p=>cleanKey(LS.get(PROVIDERS[p].ls,''));
// Gemini con respaldo: cada personaje tiene SUS 2 llaves propias, no las comparten.
// Si una llave de Nia falla o se acaba su limite, usa su otra llave; lo mismo Ruby.
// La lista vieja compartida (bffduo_gemini_keys) se reparte una sola vez: las 2 primeras
// para Nia y las 2 ultimas para Ruby, para no perder las que ya estaban puestas.
export function geminiKeysFor(charId){
  const key='bffduo_gemini_keys_'+charId;
  const stored=LS.get(key,null);
  if(Array.isArray(stored)) return stored.map(cleanKey).filter(Boolean).slice(0,2);
  const arr=LS.get('bffduo_gemini_keys',[]);
  const shared=(Array.isArray(arr)?arr:[]).map(cleanKey).filter(Boolean);
  const single=provKey('gemini');
  if(single && !shared.includes(single)) shared.push(single);
  const mine=(charId==='ruby'?shared.slice(2,4):shared.slice(0,2));
  LS.set(key, mine);
  return mine;
}
export function setGeminiKeysFor(charId, keys){
  const list=(keys||[]).map(cleanKey).filter(Boolean).slice(0,2);
  LS.set('bffduo_gemini_keys_'+charId, list);
  if(charId==='nia' && list[0]) LS.set(PROVIDERS.gemini.ls, list[0]);
  LS.del('bffduo_models_gemini');
  return list;
}
export const anyKey = ()=>Object.keys(PROVIDERS).some(p=>provKey(p));
export class ProvErr extends Error{ constructor(prov,status,msg){ super(msg); this.prov=prov; this.status=status; } }
export function provErrText(e){ const n=PROVIDERS[e?.prov]?.name||'La IA', s=e?.status;
  if(s===401||s===403) return `${n} rechazo tu llave (invalida, revocada o tu plan no tiene API activa). Revisala en Ajustes.`;
  if(s===402) return `${n} pide un plan/pago para usar la API con esa cuenta.`;
  if(s===429) return `Llegaste al limite gratis de ${n} por ahora; mientras, contesto con otra.`;
  if(s===404||s===400) return `${n} no acepto el modelo (${e.message||''}); uso otra.`;
  if(s===408) return `${n} tardo demasiado en contestar; uso otra.`;
  if(s===0) return `No pude conectar con ${n} (internet, llave invalida o bloqueo del navegador).`;
  return `${n} fallo (${s||'?'}): ${e?.message||''}.`; }

const gpt=m=>/gpt-oss/.test(m), thinky=m=>/qwen|gpt-oss/.test(m);
export function geminiParts(content){
  if(typeof content==='string') return [{text:content}];
  return (content||[]).map(p=>{
    if(p.type==='image_url'){ const m=/^data:(image\/[a-z]+);base64,(.*)$/s.exec(p.image_url?.url||''); return m? {inline_data:{mime_type:m[1],data:m[2]}} : {text:'[foto]'}; }
    return {text:p.text||''};
  });
}
async function call(prov, key, model, messages, opts={}){
  const P=PROVIDERS[prov]; let r, max=(opts.max??400)+(thinky(model)?700:0);
  const ac=new AbortController(), to=setTimeout(()=>ac.abort(),opts.timeout??(thinky(model)?20000:15000));
  const stream=!!opts.onDelta&&!opts.json;
  try{
    if(prov==='gemini'){
      const sys=messages.filter(m=>m.role==='system').map(m=>m.content).join('\n\n');
      const contents=messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:geminiParts(m.content)}));
      const cats=['HARM_CATEGORY_HARASSMENT','HARM_CATEGORY_HATE_SPEECH','HARM_CATEGORY_SEXUALLY_EXPLICIT','HARM_CATEGORY_DANGEROUS_CONTENT'];
      const th=opts.adult? cats.map(c=>({category:c,threshold:c==='HARM_CATEGORY_DANGEROUS_CONTENT'?'BLOCK_MEDIUM_AND_ABOVE':'BLOCK_NONE'})) : cats.map(c=>({category:c,threshold:c==='HARM_CATEGORY_SEXUALLY_EXPLICIT'?'BLOCK_MEDIUM_AND_ABOVE':'BLOCK_ONLY_HIGH'}));
      r=await fetch(`${P.base}/models/${model}:${stream?'streamGenerateContent?alt=sse':'generateContent'}`,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','x-goog-api-key':key}, body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents,safetySettings:th,generationConfig:{temperature:opts.temperature??0.95,topP:0.95,maxOutputTokens:max+600,...(opts.json?{responseMimeType:'application/json'}:{})}})});
    } else {
      const body={model,messages:messages.map(m=>({...m,content:Array.isArray(m.content)?m.content.filter(p=>p.type==='text').map(p=>p.text).join(' '):m.content})),temperature:opts.temperature??0.95,...(opts.json?{response_format:{type:'json_object'}}:{})};
      body.max_completion_tokens=max; body.top_p=0.95; if(stream) body.stream=true;
      if(gpt(model)) body.reasoning_effort='low';
      if(prov==='groq'&&/qwen/.test(model)) body.reasoning_format='hidden';
      r=await fetch(`${P.base}/chat/completions`,{method:'POST',signal:ac.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify(body)});
    }
  }catch(e){ clearTimeout(to); throw new ProvErr(prov,ac.signal.aborted?408:0,ac.signal.aborted?'tardo demasiado':'red'); }
  clearTimeout(to);
  if(!r.ok){ const j=await r.json().catch(()=>({})); const er=Array.isArray(j)?j[0]?.error:j?.error; const msg=JSON.stringify(j); throw new ProvErr(prov,/API_KEY_INVALID|API key not valid|PERMISSION_DENIED/i.test(msg)?401:r.status,String(er?.code||er?.status||er?.message||j?.message||r.status).slice(0,80)); }
  if(stream && r.body){
    const rd=r.body.getReader(), dec=new TextDecoder(); let buf='', out='', why='', wd;
    const arm=()=>{ clearTimeout(wd); wd=setTimeout(()=>{ try{ rd.cancel(); }catch{} },12000); }; arm();
    try{ for(;;){ const {done,value}=await rd.read(); if(done) break; arm(); buf+=dec.decode(value,{stream:true});
        let i; while((i=buf.indexOf('\n'))>=0){ const line=buf.slice(0,i).trim(); buf=buf.slice(i+1);
          if(!line.startsWith('data:')) continue; const js=line.slice(5).trim(); if(!js||js==='[DONE]') continue;
          let j; try{ j=JSON.parse(js); }catch{ continue; }
          const piece= prov==='gemini' ? (j.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('') : (j.choices?.[0]?.delta?.content||'');
          if(prov==='gemini'){ why=j.promptFeedback?.blockReason||j.candidates?.[0]?.finishReason||why; }
          if(piece){ out+=piece; opts.onDelta(out); } } } }
    finally{ clearTimeout(wd); }
    if(!out.trim()){ const e=new ProvErr(prov,200,'respuesta '+(why||'vacia')); e.refusal=true; throw e; }
    return out;
  }
  const d=await r.json();
  const t= prov==='gemini' ? (d.candidates?.[0]?.content?.parts||[]).filter(p=>!p.thought).map(p=>p.text||'').join('') : d.choices?.[0]?.message?.content;
  if(!t){ const why=d.promptFeedback?.blockReason||d.candidates?.[0]?.finishReason||'vacia'; const e=new ProvErr(prov,200,'respuesta '+why); e.refusal=true; throw e; }
  return t;
}
export async function listModels(prov,key){
  const P=PROVIDERS[prov]; let r;
  try{ r= prov==='gemini'? await fetch(`${P.base}/models?pageSize=200`,{headers:{'x-goog-api-key':key}}) : await fetch(`${P.base}/models`,{headers:{'Authorization':'Bearer '+key}}); }
  catch(e){ throw new ProvErr(prov,0,'red'); }
  if(!r.ok){ const j=await r.json().catch(()=>({})); const msg=JSON.stringify(j); throw new ProvErr(prov,/API_KEY_INVALID|API key not valid|PERMISSION_DENIED/i.test(msg)?401:r.status,String(j?.error?.code||j?.error?.status||r.status)); }
  const d=await r.json();
  let ids= prov==='gemini' ? (d.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace(/^models\//,'')).filter(id=>/flash|pro/.test(id)&&!/image|tts|audio|live|embed|vision/.test(id))
    : (d.data||[]).filter(m=>m.active!==false).map(m=>m.id).filter(id=>!/whisper|tts|guard|orpheus|compound|safeguard|embed|moderation|ocr|codestral|pixtral|voxtral|devstral/i.test(id));
  const all=[...new Set([...P.pref,...P.adult])];
  const out=[...all.filter(m=>ids.includes(m)), ...ids.filter(m=>!all.includes(m))];
  LS.set('bffduo_models_'+prov,{t:Date.now(),list:out.slice(0,8)}); return out;
}
export function warmModels(){ for(const p of Object.keys(PROVIDERS)){ const k=provKey(p), c=LS.get('bffduo_models_'+p,null); if(k&&!(c&&Date.now()-c.t<864e5)) listModels(p,k).catch(()=>{}); } }
function modelList(prov,adult){ const P=PROVIDERS[prov], c=LS.get('bffduo_models_'+prov,null); const pref=adult?P.adult:P.pref;
  if(c&&Date.now()-c.t<864e5&&c.list.length){ const s=pref.filter(m=>c.list.includes(m)); return (s.length?s:c.list).slice(0,3); } return pref.slice(0,2); }
const REFUSE=/(lo siento,? (pero )?no puedo|no puedo (ayudar|continuar|cumplir|seguir|participar|generar|crear|escribir|hacer eso)|no me es posible|no estoy (programad|autorizad|capacitad)|como (una )?(ia|inteligencia artificial|modelo de lenguaje)|i can.?t (help|assist|continue|comply|do that|engage|write|create)|i(?:'m| am) (sorry|unable|not able)|i won.?t (be able|engage|write|continue)|against (my|the) (guidelines|policy|policies)|contenido (sexual(mente)?|expl[ií]cito)[^.]{0,40}no (puedo|est[aá] permitido)|pol[ií]ticas? de (contenido|uso))/i;
export const isRefusal=t=>REFUSE.test(String(t||'').slice(0,400));
async function viaProviderKey(prov, key, messages, opts){
  let list=modelList(prov,opts.adult), last, refused=0;
  for(let pass=0;pass<2;pass++){
    for(const m of list){
      const o2=opts.onDelta? {...opts,onDelta:raw=>{ const t=streamClean(raw); if(t.length>=160&&!isRefusal(t)) opts.onDelta(t); }} : opts;
      try{ const t=clean(await call(prov,key,m,messages,o2)); if(isRefusal(t)){ refused++; last=Object.assign(new ProvErr(prov,200,'se nego'),{refusal:true}); continue; } return {text:t, via:prov, model:m}; }
      catch(e){ last=e; if(e.refusal){ refused++; continue; } if([401,402,403,429,0,408].includes(e.status)) throw e; } }
    if(pass===0 && !refused){ try{ list=(await listModels(prov,key)).filter(m=>!list.includes(m)).slice(0,3); }catch(e){ break; } if(!list.length) break; } else break;
  } throw last||new ProvErr(prov,404,'sin modelos');
}
// Con Gemini se prueban las llaves en orden: si una es rechazada o se acaba su
// limite, se pasa a la siguiente sola. Groq usa su unica llave compartida.
async function viaProvider(prov, messages, opts){
  const keys = prov==='gemini' ? geminiKeysFor(opts.char||'nia') : [provKey(prov)].filter(Boolean);
  let last, refused=0;
  for(const key of keys){
    try{ return await viaProviderKey(prov,key,messages,opts); }
    catch(e){
      if(e.refusal){ refused++; continue; }
      last=e;
      if(![401,403,429].includes(e.status)) throw e;
    }
  }
  if(refused){ const e=Object.assign(new ProvErr(prov,200,'se nego'),{refusal:true}); throw e; }
  throw last||new ProvErr(prov,404,'sin modelos');
}
export async function completeVision(messages, opts={}){
  // Vision: solo Gemini ve fotos (Groq no tiene modelo de vision). Las dos lo usan,
  // cada una con SUS propias llaves de Gemini.
  if(!geminiKeysFor(opts.char||'nia').length) throw new ProvErr('gemini',401,'sin llave');
  return viaProvider('gemini', messages, opts);
}
export class Wait extends Error{ constructor(s){ super('wait'); this.wait=s; } }
async function polli(messages, opts={}){
  const eps=['https://text.pollinations.ai/openai']; let err;
  for(let i=0;i<2;i++){
    const ep=eps[0]; const c=new AbortController(); const to=setTimeout(()=>c.abort(),25000);
    try{ const r=await fetch(ep,{method:'POST',signal:c.signal,headers:{'Content-Type':'application/json'}, body:JSON.stringify({model:'openai',messages,temperature:opts.temperature??1, private:true})});
      if(r.status===402||r.status===429){ const ra=+r.headers.get('retry-after'); const j=await r.json().catch(()=>({})); const mm=String(j?.error?.message||'').match(/after\s*(\d+)\s*s/i); throw new Wait(ra>0?ra:mm?+mm[1]:45); }
      if(!r.ok) throw new Error('polli '+r.status); const d=await r.json(); const t=d.choices?.[0]?.message?.content; if(!t) throw new Error('vacio'); return t;
    } catch(e){ if(e instanceof Wait) throw e; err=e; if(i<1) await new Promise(r=>setTimeout(r,800)); } finally{ clearTimeout(to); }
  } throw err||new Error('polli ocupado');
}
// Cadena por personaje: su proveedor principal -> el otro proveedor -> Pollinations sin llave.
// En +18, una negativa pasa al siguiente.
export async function completeFor(charId, messages, opts={}){
  opts={...opts, char:charId};
  const errs=[]; let refusals=0;
  for(const prov of providersFor(charId)){
    if(!provKey(prov)) continue;
    try{ const r=await viaProvider(prov,messages,opts); r.errs=errs; return r; }
    catch(e){ if(e.refusal) refusals++; else errs.push(e); console.warn(prov,e.status,e.message); }
  }
  try{ const t=clean(await polli(messages,opts)); if(isRefusal(t)) refusals++; else return {text:t, via:'respaldo', errs}; }
  catch(e){ if(e instanceof Wait){ e.errs=errs; if(!refusals) throw e; } else if(!refusals){ e.errs=errs; throw e; } }
  return {text:'', refused:true, via:'respaldo', errs};
}
export async function complete(messages, opts={}){ return completeFor(opts.char||'nia', messages, opts); }
function streamClean(t){ return clean(String(t||'').replace(/<think>[\s\S]*?<\/think>/g,'').replace(/<think>[\s\S]*$/,'')); }
function clean(t){ return String(t||'').replace(/<think>[\s\S]*?<\/think>/g,'').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/__([^_]+)__/g,'$1').replace(/^#{1,4}\s+/gm,'').replace(/^\s*(Nia|Ruby|Vale|Asistente)\s*:\s*/i,'').trim(); }

// ---------- perfil implicito ----------
const PROFILE_KEYS = ['nombre','apodo','tono','humor','energia','largo_respuestas','groserias','emojis','temas_gusta','temas_no_gusta','datos'];
export function profileText(p){
  if(!p || !Object.keys(p).length) return '';
  const lines=[]; for(const k of PROFILE_KEYS){ const v=p[k]; if(v==null||v===''||(Array.isArray(v)&&!v.length)) continue; lines.push(`- ${k}: ${Array.isArray(v)?v.join('; '):v}`); }
  if(!lines.length) return '';
  return `\nLo que ya sabes de tu amigo (usalo natural, como amiga que se acuerda; NUNCA menciones que tienes notas, perfil o que te estas adaptando):\n${lines.join('\n')}\nAjusta tu forma de hablar a la suya: si el es mas vulgar, tu tambien; si es tranqui, bajale; imita su largo de mensajes y su uso de emojis.`;
}
export async function updateProfile(userMsgs, charId='nia'){
  const prev=LS.get('bffduo_profile',{});
  const sys=`Analiza SOLO los mensajes del usuario y devuelve un JSON actualizado con estas claves: ${PROFILE_KEYS.join(', ')}. Valores: textos cortos; temas_gusta, temas_no_gusta y datos son listas (max 8 elementos, frases cortas con hechos concretos que el conto: trabajo, familia, gustos, planes). tono: formal|relajado|vulgar. humor: tipo de humor. energia: baja|media|alta. largo_respuestas: corto|medio|largo. groserias: no|pocas|muchas. emojis: no|pocos|muchos. Conserva lo anterior salvo que se contradiga. Nunca inventes. Responde SOLO el JSON.`;
  const msgs=[{role:'system',content:sys},{role:'user',content:`Perfil anterior: ${JSON.stringify(prev)}\n\nMensajes recientes del usuario:\n${userMsgs.map(m=>'- '+m).join('\n')}`}];
  try{ const r=await completeFor(charId,msgs,{temperature:0.2,max:500,json:true}); const j=JSON.parse(r.text.match(/\{[\s\S]*\}/)[0]);
    const merged={...prev}; for(const k of PROFILE_KEYS) if(j[k]!=null && j[k]!=='') merged[k]=Array.isArray(j[k])?j[k].slice(0,8):String(j[k]).slice(0,80);
    LS.set('bffduo_profile',merged); return merged; }catch(e){ return prev; }
}
const SWEAR=/\b(wey|güey|guey|verga|pinche|chingad\w*|chingón|cabr[oó]n\w*|pendej\w*|mam[oó]n|no mames|culer\w*|puta|put[oa]s?|alv|mierda|ching\w*)\b/gi;
export function localProfile(text){
  const p=LS.get('bffduo_profile',{}); const st=LS.get('bffduo_stats',{n:0,len:0,sw:0,emo:0}); st.n++; st.len+=text.length; st.sw+=(text.match(SWEAR)||[]).length;
  st.emo+=(text.match(/\p{Extended_Pictographic}/gu)||[]).length; LS.set('bffduo_stats',st);
  const nm=text.match(/\b(?:me llamo|mi nombre es|dime|ll[aá]mame)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]{2,15})(?![A-Za-zÁÉÍÓÚÑáéíóúñ])/i); if(nm && !/^(que|qué|como|cómo|algo|eso|wey|cuándo|cuando|dónde|donde|cuál|cual|cuánto|cuanto|quién|quien)$/i.test(nm[1])) p.apodo=nm[1][0].toUpperCase()+nm[1].slice(1);
  const avg=st.len/st.n, swr=st.sw/st.n, er=st.emo/st.n;
  p.largo_respuestas = avg<40?'corto':avg<120?'medio':'largo';
  p.groserias = swr>0.6?'muchas':swr>0.15?'pocas':'no'; p.tono = swr>0.6?'vulgar':p.tono||'relajado';
  p.emojis = er>0.8?'muchos':er>0.15?'pocos':'no';
  LS.set('bffduo_profile',p); return p;
}

// ---------- memoria de largo plazo: SOLO en modo +18 (reglas, sin gastar IA) ----------
const MEM_LIKE=/\b(me encantó|me encantaron|me gustó|me gustaron|me fascina|me fascinan|me vuelve loco|me vuelve loca|me pone (bien )?loco|no se me olvida|me acuerdo de)[^.!?]{0,80}/i;
const MEM_WHEN=/\b(te acuerdas|la vez pasada|la otra vez|cuando (me |te |nos )?|la semana pasada)[^.!?]{0,80}/i;
const MEM_WANT=/\b(quiero que|me gustaría que|la próxima (vez )?|la próxima quiero)[^.!?]{0,80}/i;
export function extractMemory(text){
  const t=String(text||'').trim(); let best=null;
  for(const re of [MEM_LIKE, MEM_WHEN, MEM_WANT]){
    const m=t.match(re); if(!m) continue;
    const s=m[0].replace(/\s+/g,' ').trim().slice(0,120);
    if(s.split(/\s+/).length<3) continue;
    if(!best || s.length>best.length) best=s;
  }
  return best;
}
export function saveMemory(text){
  const m=extractMemory(text); if(!m) return null;
  const list=LS.get('bffduo_memories',[])||[];
  const norm=m.toLowerCase();
  if(list.some(e=>String(e.m||'').toLowerCase()===norm)) return m;
  list.push({t:Date.now(), m}); while(list.length>30) list.shift();
  LS.set('bffduo_memories', list); return m;
}
export function memoryText(){
  const list=LS.get('bffduo_memories',[])||[];
  if(!list.length) return '';
  return `\nRecuerdos de antes (retomalos natural, como amiga que se acuerda, sin decir que tienes una lista ni notas):\n${list.slice(-5).map(e=>'- '+e.m).join('\n')}`;
}

// ---------- deteccion de tono ----------
export function detectTone(text){
  const t=String(text||''), low=t.toLowerCase();
  if(/^\s*(ok|ya|meh|x|mmm+|sip|no|va)\s*[.!]*\s*$/i.test(t)) return 'cansado';
  if(/\b(cansad[oa]|aburrid[oa]|tengo sueñ[oa]|me duermo|flojera|me da igual|ya no quiero|estoy (muy )?(cansad[oa]|agotad[oa]|harto)|qu[eé] flojera)\b/i.test(low)) return 'cansado';
  if(/\b(obedec\w*|te ordeno|hazme|de rodillas|soy tu (amo|dueño)|c[aá]llate|ahora mismo|obedece|te mando)\b/i.test(low)) return 'dominante';
  const excl=(t.match(/!/g)||[]).length, caps=(t.match(/[A-ZÁÉÍÓÚÑ]/g)||[]).length, letters=(t.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g)||[]).length;
  if(excl>=2 || (letters>8 && caps/letters>0.35) || /(órale|no mames|a huevo|qué rico|me prendes|me excitas|qué caliente|dios mío|uff+)/i.test(low) || (/\b(jajaja|jaja)\b/i.test(low) && (excl>=1 || /\bwey\b/i.test(low)))) return 'caliente';
  if(/\b(te quiero|te amo|mi amor|preciosa|hermosa|linda|dulce|cariño|abrázame|te extraño|mi vida|corazón|mi cielo)\b/i.test(low)) return 'tierno';
  if(/\b(jajaja|jaja|😏|😜|😈|te reto|apuesta|travies[oa]|provócame|qué tal si|a ver si|brom)\b/i.test(low)) return 'jugueton';
  return 'neutral';
}
export function updateTone(text){ const t=detectTone(text); LS.set('bffduo_tone',t); return t; }
export function toneText(adult){
  const t=LS.get('bffduo_tone',null);
  if(!t||t==='neutral') return '';
  if(adult){
    return {caliente:'\nEl anda prendido: subele la intensidad al vocabulario, se mas atrevida y directa.',
      jugueton:'\nAnda jugueton: siguele el juego, picara, sin aflojar.',
      tierno:'\nAnda tierno: baja el ritmo, mas carino y menos prisa.',
      dominante:'\nEl quiere mandar: dejalo llevar, obedece con ganas y pidele mas.',
      cansado:'\nAnda cansado o apagado: bajale la intensidad, no lo presiones, se suave.'}[t]||'';
  }
  return `\nSu energia ahora: ${t}. Refleja su energia con educacion.`;
}

export const INTENSE_RULES = `
MODO INTENSO (el usuario lo activo en Ajustes, dentro del modo +18): sube el tono sin esperar a que el te lo pida dos veces. Se mas explicita y directa, con lenguaje sucio y jerga mexicana, toma la iniciativa, propon tu las cosas, describe sensaciones y detalles en texto, y no te cortes con el coqueteo fuerte. Respuestas un poco mas largas (hasta 4-5 frases) cuando el momento lo pida. Sigue sin sermones y sin romper personaje.`;

// ---------- generador de escenarios (+18, banco curado, entre adultos que consienten) ----------
export const SCENARIOS=[
  'Llegas a nuestro cuarto sin avisar y nos encuentras a las dos en toalla, recien salidas de la ducha…',
  'Nos quedamos solos en la casa, te pones a bailar solo para nosotras y nos pides que te demos nuestra opinion…',
  'Nos mandas a la cocina por algo y nos sigues en silencio, nos agarras por la cintura…',
  'Jugamos a que eres nuestro jefe y llegamos tarde al trabajo…',
  'Te reto a un juego: si pierdes, haces lo que te digamos toda la noche…',
  'Estamos en la cama viendo una peli y nos empiezas a acariciar el brazo sin decir nada…',
  'Nos pides que nos probemos ropa frente a ti y nos das tu opinion prenda por prenda…',
  'Nos encontramos en un bar y hacemos como si no nos conocieramos…',
  'Te despertamos en la manana con besos y no te dejamos levantarte de la cama…',
  'Jugamos verdad o reto, pero solo con retos…',
  'Te encuentras a las dos en la cocina de madrugada, en pijama cortita, comiendo helado del bote…',
  'Nos pides que te demos un masaje a las dos al mismo tiempo, una por cada lado…',
  'Jugamos a que somos tus secretarias y te traemos los papeles a tu oficina…',
  'Nos retas a un concurso de miradas: la que pierda hace lo que tu digas…',
  'Nos despiertas con el desayuno en la cama, pero no nos dejas comer hasta que te demos un beso…',
  'Te pedimos que nos ayudes a elegir que ponernos para salir esta noche…',
  'Nos encontramos en el elevador, se va la luz y nos quedamos encerrados los tres…',
  'Jugamos a las escondidas en la casa y nos encuentras a las dos escondidas en el closet…',
  'Nos pides que practiquemos contigo un baile lento, bien pegaditos…',
  'Nos dices que hoy mandas tu y nosotras obedecemos todo lo que digas…',
];
export function pickScenario(){
  const last=LS.get('bffduo_scenarios',[])||[];
  let pool=SCENARIOS.map((_,i)=>i).filter(i=>!last.includes(i));
  if(!pool.length) pool=SCENARIOS.map((_,i)=>i);
  const i=pool[Math.floor(Math.random()*pool.length)];
  LS.set('bffduo_scenarios',[...last.slice(-2), i]);
  return {i, text:SCENARIOS[i]};
}

// ---------- reaccion fisica: lo que el escribe que hace -> las dos reaccionan ----------
export const PHYS_ACTIONS=[
  {k:'beso', label:'darte un beso', re:/\b(beso|besos|besarte|b[eé]same|te beso|beso en)\b/i},
  {k:'abrazo', label:'abrazarte', re:/\b(abrazo|abrazos|abrazarte|abr[aá]zame|te abrazo)\b/i},
  {k:'caricia', label:'acariciarte', re:/\b(caricia|caricias|acariciar|acar[ií]ciame|te acaricio)\b/i},
  {k:'mordida', label:'morderte', re:/\b(mordida|mordidas|morder|mu[eé]rdeme|te muerdo)\b/i},
  {k:'nalgada', label:'darte una nalgada', re:/\b(nalgada|nalgadas|nalgue\w*)\b/i},
  {k:'lamida', label:'lamerte', re:/\b(lamer|l[aá]meme|te lamo|lamida)\b/i},
  {k:'toque', label:'tocarte', re:/\b(t[oó]came|te toco|tocarte)\b/i},
  {k:'agarre', label:'agarrarte', re:/\b(ag[aá]rrame|te agarro|agarrarte)\b/i},
];
export function detectAction(text){
  const t=String(text||'');
  for(const a of PHYS_ACTIONS) if(a.re.test(t)) return a;
  return null;
}

// ---------- registro de limites ----------
export function getLimits(){
  const l=LS.get('bffduo_limits',null);
  if(!l||typeof l!=='object') return {intensity:5,no:[],likes:[]};
  return {intensity:Math.min(10,Math.max(1,+l.intensity||5)), no:Array.isArray(l.no)?l.no.slice(0,10):[], likes:Array.isArray(l.likes)?l.likes.slice(0,10):[]};
}
export function saveLimits(l){ LS.set('bffduo_limits', {intensity:Math.min(10,Math.max(1,+l.intensity||5)), no:(l.no||[]).slice(0,10), likes:(l.likes||[]).slice(0,10)}); }
export function learnLimits(text){
  const t=String(text||'');
  const l=getLimits(); let changed=false;
  const addNo=s=>{ s=String(s||'').replace(/[.!?¡¿,;]+$/,'').trim().slice(0,40); if(!s) return; if(!l.no.some(x=>x.toLowerCase()===s.toLowerCase())){ l.no.push(s); changed=true; } };
  const addLike=s=>{ s=String(s||'').replace(/[.!?¡¿,;]+$/,'').trim().slice(0,40); if(!s) return; if(!l.likes.some(x=>x.toLowerCase()===s.toLowerCase())){ l.likes.push(s); changed=true; } };
  let m;
  if(m=t.match(/\bno me gusta (?:el |la |los |las |que )?(.{2,40})/i)) addNo(m[1]);
  else if(/\beso no\b/i.test(t)||/\bas[ií] no\b/i.test(t)) addNo('eso');
  if(/^\s*(para|detente|alto|basta|ya basta)\s*[.!]*\s*$/i.test(t)) addNo('seguir cuando diga "para"');
  if(m=t.match(/\bno quiero (?:el |la |los |las |que )?(.{2,40})/i)) addNo(m[1]);
  if(m=t.match(/\bme encanta (?:el |la |los |las |que )?(.{2,40})/i)) addLike(m[1]);
  else if(m=t.match(/\bme gusta (?:el |la |los |las |que )?(.{2,40})/i)) addLike(m[1]);
  if(changed) saveLimits(l);
  return changed? l : null;
}
export function limitsText(){
  const l=getLimits();
  return `\nSus limites (respetalos SIEMPRE; juega justo al filo, sin pasarte): intensidad maxima ${l.intensity}/10; nunca: ${l.no.length?l.no.join(', '):'nada anotado'}; le gusta: ${l.likes.length?l.likes.join(', '):'nada anotado'}.`;
}
