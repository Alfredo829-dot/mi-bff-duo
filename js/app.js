// Mi BFF Duo v1.0 — Nia y Ruby, las dos con Gemini y Groq, juntas en el mismo cuarto, sin celular.
import { LS, CHARACTERS, BASE_PERSONA, LEAD_RULES, profileText, guard, minorSignal, researchQuery, webSearch, completeFor, completeVision, updateProfile, localProfile, cleanKey, PROVIDERS, provKey, geminiKeys, setGeminiKeys, listModels, provErrText, ADULT_RULES, warmModels, updateTone, toneText, saveMemory, memoryText, pickScenario, detectAction, getLimits, learnLimits, limitsText } from './ai.js';
import * as V from './voice.js';

const VERSION='1.0.0';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

let cfg=Object.assign({voice:'es-MX',voiceRate:1,sysVoice:null,voiceNia:null,voiceRuby:null,readAloud:true,dev:false,persona:'',personaNia:'',personaRuby:'',target:'both',adult:false},LS.get('bffduo_cfg',{}));
if(!['nia','ruby','both'].includes(cfg.target)) cfg.target='both';
let hist=LS.get('bffduo_hist',[]);
const saveCfg=()=>LS.set('bffduo_cfg',cfg), saveHist=()=>LS.set('bffduo_hist',hist.slice(-200));
let userCount=LS.get('bffduo_ucount',0);
let busy=false, talking=null, lastUserAt=Date.now(), nudged=false, lastPoke=0;
let recognizer=null, listening=false;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const DEFLECT=['Jajaja, ¿neta? A ver, cuentame otra cosa 😏','Uy, eso no me late contarlo asi. ¿Que mas traes?','Mejor cambiemos de tema, ¿va? Cuentanos algo chido.'];

// ---------- escena: mirada que sigue al usuario ----------
addEventListener('pointermove',e=>{
  const x=(e.clientX/innerWidth-0.5)*2;
  const duo=$('#duo'); if(duo) duo.style.setProperty('--tilt',(x*1.2)+'deg');
});
function setTalking(charId){
  talking=charId;
  $$('.char').forEach(el=>el.classList.remove('talking'));
  if(charId){ const el=$('#char-'+charId); if(el) el.classList.add('talking'); }
}
function setTyping(charId,on){
  const el=$('#typing-'+charId); if(el) el.classList.toggle('hidden',!on);
}
function reactOther(charId){
  const other = charId==='nia'?'ruby':'nia';
  const el=$('#char-'+other); if(!el) return;
  el.classList.remove('react'); void el.offsetWidth; el.classList.add('react');
}
let bubbleUntil=0;
function say(text,ms){ return; } // burbuja desactivada: nada de texto flotando entre las fotos
const fmtTime=t=>{ if(!t) return ''; const d=new Date(t); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); };

// ---------- chat ----------
function push(m){ if(!m.t) m.t=Date.now(); hist.push(m); saveHist(); render(); }
function render(){
  const box=$('#msgs'); if(!box) return;
  box.innerHTML=hist.slice(-200).map(m=>{
    if(m.role==='sys') return `<div class="msg sys">${esc(m.content)}</div>`;
    if(m.role==='user') return `<div class="msg user">${esc(m.content)}<span class="time">${fmtTime(m.t)}</span></div>`;
    const who=m.who||'nia'; const name=who==='ruby'?'Ruby':'Nia';
    return `<div class="msg ${who}"><span class="who">${esc(name)}${m.via?` · ${esc(m.via)}`:''}</span>${esc(m.content)}${m.err?`<span class="err"><br>${esc(m.err)}</span>`:''}<span class="time">${fmtTime(m.t)}</span></div>`;
  }).join('');
  box.scrollTop=box.scrollHeight;
}
function buildSystem(charId, extra='', auto=false){
  const c=CHARACTERS[charId];
  // Personalidad escrita por la usuaria (como la de Vale en Mi BFF AI): si hay una,
  // REEMPLAZA la personalidad base de ese personaje; si no, se usa la base.
  const custom=(charId==='nia'?cfg.personaNia:cfg.personaRuby)||'';
  const base=custom.trim()? custom.trim()+'\n'+LEAD_RULES : BASE_PERSONA(c.name);
  const ctx = extra ? `\nContexto de la web (resumido):\n${extra}` : '';
  // En modo Ambas, cada una sabe que esta con la otra en el mismo cuarto.
  const duoNote = (cfg.target==='both'||auto) ? `\nEstas con ${charId==='nia'?'Ruby':'Nia'} en el mismo cuarto. Pueden reaccionar la una a la otra, pero tu respondes por ti, en primera persona.` : '';
  return base+(cfg.adult?ADULT_RULES(c.name):'')+ctx+duoNote+profileText(LS.get('bffduo_profile',{}))+(cfg.adult?memoryText()+limitsText():'')+toneText(!!cfg.adult)+ (cfg.persona?`\nNota del usuario: ${cfg.persona}`:'');
}
function warnErrs(errs){
  if(!errs||!errs.length) return;
  const last=errs[errs.length-1];
  push({role:'sys',content:'⚠️ '+provErrText(last)});
}
async function askOne(charId, text, opts={}){
  const msgs=[{role:'system',content:buildSystem(charId, opts.ctx||'', !!opts.auto)}];
  // Ultimos 12 mensajes de historial, salvo en la reaccion entre ellas,
  // donde el unico mensaje de usuario es la linea a reaccionar.
  const tail=opts.skipTailPush?[]:hist.filter(m=>m.role!=='sys').slice(-12).map(m=>({role:m.role==='user'?'user':'assistant',content:m.content}));
  msgs.push(...tail);
  msgs.push({role:'user',content:text});
  setTyping(charId,true); setTalking(charId);
  const onDelta = t=>{ /* streaming: se muestra al final para no parpadear el chat */ };
  try{
    const r=await completeFor(charId,msgs,{adult:!!cfg.adult,onDelta});
    if(r.refused) return {text:pick(DEFLECT),via:r.via};
    return r;
  } finally { setTyping(charId,false); }
}
async function askPhoto(charId, caption, dataUrl){
  // Las dos ven fotos: Nia y Ruby comentan fotos con Gemini (vision).
  const msgs=[{role:'system',content:buildSystem(charId,'La usuaria te mando una foto. Comenta lo que ves, en personaje, corto y con carino.')}];
  msgs.push({role:'user',content:[{type:'text',text:caption||'¿Que ves en esta foto?'},{type:'image_url',image_url:{url:dataUrl}}]});
  setTyping(charId,true); setTalking(charId);
  try{ const r=await completeVision(msgs,{adult:!!cfg.adult}); warnErrs(r.errs); if(r.refused) return {text:pick(DEFLECT),via:r.via}; return r; }
  finally{ setTyping(charId,false); }
}
async function send(text, opts={}){
  text=(text||'').trim(); if(!text||busy) return;
  if(autoTalk) stopAuto(); // si escribes, ellas se callan y te contestan a ti
  busy=true;
  try{
    const minorInAdult=cfg.adult && minorSignal(text,true);
    if(minorInAdult){ cfg.adult=false; saveCfg(); push({role:'sys',content:'🔞 Modo +18 desactivado: hubo señal de que podrías ser menor de edad. Si fue un error, vuelve a activarlo en Ajustes.'}); syncAdult(); }
    const g=guard(text, minorInAdult || !!cfg.adult);
    if(!opts.nopush){ push({role:'user',content:text}); userCount++; LS.set('bffduo_ucount',userCount); localProfile(text); }
    lastUserAt=Date.now(); nudged=false;
    if(cfg.adult){ saveMemory(text); learnLimits(text); }
    updateTone(text);
    if(g){ push({role:'nia',who:'nia',content:g}); say(g); speakFor('nia',g); busy=false; return; }
    const rq=researchQuery(text);
    let ctx='';
    if(rq){ const res=await webSearch(rq).catch(()=>[]); if(res.length) ctx=res.map(r=>`${r.title}: ${r.text} (${r.url})`).join('\n'); }
    const physAct=cfg.adult?detectAction(text):null;
    const targets = cfg.target==='both' ? ['nia','ruby'] : [cfg.target];
    for(const charId of targets){
      const r=await askOne(charId, text, {ctx});
      push({role:'assistant',who:charId,content:r.text,via:r.via});
      say(r.text); speakFor(charId,r.text);
      if(physAct) reactOther(charId);
    }
    if(hist.filter(m=>m.role==='user').length%6===0) updateProfile(hist.filter(m=>m.role==='user').slice(-10).map(m=>m.content), targets[0]).catch(()=>{});
  }catch(e){
    console.warn(e);
    if(e && e.wait) push({role:'sys',content:`⏳ La IA gratis esta ocupada, espera ${e.wait}s y vuelve a intentar.`});
    else push({role:'sys',content:'No pude contestar ahorita. Revisa tus llaves en Ajustes o intenta de nuevo.'});
  }finally{ busy=false; setTalking(null); }
}
function speakFor(charId,text){
  if(!cfg.readAloud) return;
  const pitch = charId==='ruby'?0.9:1.15;
  // Cada una con su propia voz de mujer: la elegida en Ajustes, o la
  // primera voz bonita en español que tenga el celular, distinta para cada una.
  const voiceName = (charId==='nia' ? (cfg.voiceNia||autoVoices.nia) : (cfg.voiceRuby||autoVoices.ruby)) || cfg.sysVoice || null;
  V.unlockAudio();
  V.speak(text,{pitch,rate:cfg.voiceRate,voiceName,onEnd:()=>{ if(talking===charId) setTalking(null); }});
}
// Voces bonitas de mujer en español: se buscan entre las voces del celular.
let autoVoices={nia:null,ruby:null};
function refreshAutoVoices(){
  const vs=V.listVoices().filter(v=>v.lang && v.lang.toLowerCase().startsWith('es'));
  if(!vs.length) return;
  const fem=vs.filter(v=>/female|femenina|mujer|paulina|mónica|monica|lucía|lucia|carmen|sofía|sofia|valentina|isabela|juana|rosa|maría|maria|laura|ana|elena|google español/i.test(v.name));
  const pool=fem.length>=2?fem:(fem.length===1?[...fem,...vs.filter(v=>!fem.includes(v))]:vs);
  autoVoices.nia=pool[0]?.name||null;
  autoVoices.ruby=pool[1]?.name||pool[0]?.name||null;
}
if('speechSynthesis' in window){ try{ speechSynthesis.addEventListener('voiceschanged',refreshAutoVoices); }catch{} }

// ---------- modo automatico: hablan entre ellas solas ----------
let autoTalk=false, autoTurns=0, autoErrs=0;
function setAutoBtn(){
  const b=$('#autoBtn'); if(!b) return;
  b.classList.toggle('active',autoTalk);
  b.textContent=autoTalk?'⏸️ Pararlas':'▶️ Hablen solas';
}
function stopAuto(){
  autoTalk=false; setAutoBtn();
}
async function autoLoop(){
  let speaker='nia', lastText='';
  while(autoTalk){
    if(busy){ await sleep(500); continue; }
    if(autoTurns>=30){ stopAuto(); push({role:'sys',content:'⏸️ Se pausó el modo automático después de 30 turnos. Toca “Hablen solas” para que sigan.'}); break; }
    busy=true;
    try{
      const prompt = lastText
        ? `${speaker==='nia'?'Ruby':'Nia'} acaba de decir: "${lastText}". Contestale en 1-2 frases cortas, en personaje, como si platicaran entre ustedes dos en el cuarto. No repitas lo mismo.`
        : `Empieza una platica con ${speaker==='nia'?'Ruby':'Nia'}, en personaje, 1-2 frases cortas. Preguntale algo o cuentale algo del cuarto.`;
      const r=await askOne(speaker, prompt, {auto:true});
      if(r.refused){ lastText=pick(DEFLECT); }
      else{
        lastText=r.text; autoErrs=0;
        push({role:'assistant',who:speaker,content:r.text,via:r.via});
        say(r.text); speakFor(speaker,r.text); reactOther(speaker);
      }
      autoTurns++;
    }catch(e){
      autoErrs++;
      if(autoErrs>=2){ stopAuto(); push({role:'sys',content:'⏸️ Se pausó el modo automático, no pude contestar. Revisa tus llaves en Ajustes o intenta de nuevo.'}); break; }
    }finally{ busy=false; setTalking(null); }
    await sleep(2800);
  }
}
function toggleAuto(){
  if(autoTalk){ stopAuto(); push({role:'sys',content:'⏸️ Modo automático apagado.'}); return; }
  if(!provKey('groq') && !provKey('gemini')) push({role:'sys',content:'Sin llaves, hablan con Pollinations gratis, puede tardar un poco entre turnos.'});
  autoTalk=true; autoTurns=0; autoErrs=0; setAutoBtn();
  push({role:'sys',content:'▶️ Modo automático: Nia y Ruby platican solas. Escribe algo o toca ⏸️ para pararlas.'});
  autoLoop();
}
async function regenerate(){
  const lastUser=[...hist].reverse().find(m=>m.role==='user');
  if(!lastUser||busy) return;
  // Quita las respuestas posteriores al ultimo mensaje del usuario.
  const idx=hist.lastIndexOf(lastUser);
  hist=hist.slice(0,idx+1); saveHist(); render();
  await send(lastUser.content, {nopush:true});
}

// ---------- foto: las dos la ven (por Gemini vision) ----------
async function sendPhoto(file){
  if(!file||busy) return;
  if(!provKey('gemini')){ push({role:'sys',content:'Para que Nia y Ruby vean fotos necesitas tu llave gratis de Gemini en Ajustes → Llaves. Con esa llave las dos ven fotos; Groq es para respuestas rápidas de texto.'}); return; }
  const dataUrl=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
  // Achicar antes de mandar: solo se guarda una miniatura.
  const small=await shrinkImage(dataUrl).catch(()=>dataUrl);
  push({role:'user',content:'[foto enviada 📷]'});
  busy=true;
  try{
    const g=guard('foto', !!cfg.adult);
    if(g){ push({role:'nia',who:'nia',content:g}); return; }
    // La foto la comenta quien tengas elegida; con Ambas, las dos.
    const targets = cfg.target==='both' ? ['nia','ruby'] : [cfg.target];
    for(const charId of targets){
      const r=await askPhoto(charId,'¿Que ves en esta foto? Comentala en personaje.', small);
      push({role:'assistant',who:charId,content:r.text,via:r.via}); say(r.text); speakFor(charId,r.text);
    }
  }catch(e){ push({role:'sys',content:'No pude comentar la foto. Revisa tu llave de Gemini en Ajustes.'}); }
  finally{ busy=false; setTalking(null); }
}
function shrinkImage(dataUrl){
  return new Promise((res,rej)=>{
    const im=new Image(); im.onload=()=>{ const c=document.createElement('canvas'); const s=Math.min(1,800/Math.max(im.width,im.height)); c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext('2d').drawImage(im,0,0,c.width,c.height); res(c.toDataURL('image/jpeg',0.8)); }; im.onerror=rej; im.src=dataUrl;
  });
}

// ---------- microfono ----------
function toggleMic(){
  if(listening){ try{ recognizer?.stop(); }catch{} listening=false; $('#micBtn').textContent='🎙️'; return; }
  const r=V.createRecognizer(t=>{ $('#input').value=t; send(t); },()=>{ listening=false; $('#micBtn').textContent='🎙️'; });
  if(!r){ push({role:'sys',content:'Tu navegador no permite el microfono aqui. Prueba en Chrome.'}); return; }
  recognizer=r; listening=true; $('#micBtn').textContent='⏹️'; V.unlockAudio(); V.stopSpeaking();
  try{ r.start(); }catch{ listening=false; $('#micBtn').textContent='🎙️'; }
}

// ---------- escenarios +18 ----------
async function proposeScenario(){
  if(!cfg.adult||busy) return;
  const s=pickScenario();
  push({role:'assistant',who:'ruby',content:`🎲 ¿Y si jugamos esto? ${s.text}`,via:'ruby'});
  say(s.text);
}

// ---------- Ajustes ----------
function openSettings(){
  const el=$('#sheet'); const limits=getLimits(); const mems=LS.get('bffduo_memories',[])||[];
  const voices=V.listVoices();
  const esVoices=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith('es'));
  const voiceList=esVoices.length?esVoices:voices;
  el.innerHTML=`
    <h2>Ajustes — Mi BFF Duo</h2>
    <p class="note">Nia y Ruby usan las dos APIs: Gemini y Groq. La llave de Groq es una sola y la comparten las dos. De Gemini puedes poner hasta 4 llaves de respaldo: si una falla o se acaba su límite, usan la siguiente solas. Las llaves se guardan solo en este navegador.</p>
    <label>Llaves Gemini — para que LAS DOS vean fotos (aistudio.google.com)</label>
    <input type="password" id="kGem1" placeholder="Llave Gemini 1 — AIza…" value="${geminiKeys()[0]?'•• guardada ••':''}">
    <input type="password" id="kGem2" placeholder="Llave Gemini 2 (respaldo) — AIza…" value="${geminiKeys()[1]?'•• guardada ••':''}">
    <input type="password" id="kGem3" placeholder="Llave Gemini 3 (respaldo) — AIza…" value="${geminiKeys()[2]?'•• guardada ••':''}">
    <input type="password" id="kGem4" placeholder="Llave Gemini 4 (respaldo) — AIza…" value="${geminiKeys()[3]?'•• guardada ••':''}">
    <label>Llave Groq — la comparten las dos, respuestas rápidas de texto (console.groq.com)</label>
    <input type="password" id="kGroq" placeholder="gsk_…" value="${provKey('groq')?'•• guardada ••':''}">
    <p class="note">Sin llave de Gemini, ninguna de las dos ve fotos. Sin llaves, cada una contesta con Pollinations gratis. Si una API falla, la otra entra de respaldo.</p>
    <label>💬 Personaliza sus respuestas (a tu gusto)</label>
    <input type="text" id="sPersona" placeholder="Ej: háblame con cariño, usa apodos, contesta corto y directo" value="${esc(cfg.persona||'')}">
    <p class="note">Esto se lo digo a Nia y a Ruby en cada respuesta, para que te contesten como tú quieras. Déjalo vacío para que contesten normal.</p>
    <label>💜 Personalidad de Nia (como la de Vale: escribe cómo quieres que hable)</label>
    <textarea id="sPersonaNia" rows="4" placeholder="Ej: tranquila y dulce, coqueta, habla como chilanga suave, que te diga wey y te pregunte cosas...">${esc(cfg.personaNia||'')}</textarea>
    <label>❤️ Personalidad de Ruby (como la de Vale: escribe cómo quieres que hable)</label>
    <textarea id="sPersonaRuby" rows="4" placeholder="Ej: atrevida y directa, desmadrosa, que diga groserías con cariño y te eche carrilla...">${esc(cfg.personaRuby||'')}</textarea>
    <p class="note">Si escribes aquí, esa personalidad REEMPLAZA la base de ese personaje, igual que la personalidad de Vale en Mi BFF AI. Si lo dejas vacío, usan su personalidad base. La nota de arriba ("Personaliza sus respuestas") se sigue aplicando además de esto.</p>
    <label>💜 Voz de Nia (bonita, de mujer)</label>
    <input type="text" id="sVoiceNia" list="voicesEs" placeholder="Voz bonita en español" value="${esc(cfg.voiceNia||autoVoices.nia||'')}">
    <label>❤️ Voz de Ruby (bonita, de mujer)</label>
    <input type="text" id="sVoiceRuby" list="voicesEs" placeholder="Otra voz bonita en español" value="${esc(cfg.voiceRuby||autoVoices.ruby||'')}">
    <datalist id="voicesEs">${voiceList.map(v=>`<option value="${esc(v.name)}">`).join('')}</datalist>
    <p class="note">Si tu celular tiene varias voces en español, elige una distinta para cada una. Si no eliges, les pongo solas las dos más bonitas que encuentre. Prueba con “Leer respuestas en voz alta” prendido.</p>
    <label>Velocidad de voz: <span id="rateNote">${Math.round(cfg.voiceRate*100)}%</span></label>
    <input type="range" id="sRate" min="75" max="150" value="${Math.round(cfg.voiceRate*100)}">
    <div class="row"><label style="margin:0">🔊 Leer respuestas en voz alta</label><input type="checkbox" id="sRead" ${cfg.readAloud?'checked':''}></div>
    <div class="row"><label style="margin:0">🔞 Modo +18 (solo texto)</label><input type="checkbox" id="sAdult" ${cfg.adult?'checked':''}></div>
    <p class="note">Platica coqueta/subida de tono entre adultos, solo texto. Su ropa, poses y animaciones no cambian. Apagado por defecto.</p>
    <div id="adultBox" style="display:${cfg.adult?'block':'none'}">
      <label>Intensidad maxima: <span id="intNote">${limits.intensity}/10</span></label>
      <input type="range" id="sInt" min="1" max="10" value="${limits.intensity}">
      <label>Memorias guardadas</label><p class="note" id="sMemNote">${mems.length} recuerdos guardados.</p>
      <button id="sMemBtn">Ver memorias</button> <button id="sMemDel">Borrar memorias</button>
      <div id="sMemList" style="display:none"></div>
      <label>Lista de "no"</label><div id="sNoList">${limits.no.map((n,i)=>`<button data-no="${i}">✕ ${esc(n)}</button>`).join(' ')||'<span class="note">Nada anotado.</span>'}</div>
      <div class="row"><input type="text" id="sNoAdd" placeholder="Agregar un &quot;no&quot;"><button id="sNoBtn">Agregar</button></div>
    </div>
    <div class="row"><button id="sReset">🗑️ Borrar chat y datos</button><button id="sRegen">↻ Otra respuesta</button></div>
    <button class="primary close" id="sClose">Cerrar</button>`;
  el.classList.remove('hidden');
  const saveKey=(prov,inputId)=>{ const raw=$(inputId).value; if(raw.startsWith('••')) return; const v=cleanKey(raw); const P=PROVIDERS[prov]; if(v) LS.set(P.ls,v); else LS.del(P.ls); LS.del('bffduo_models_'+prov); };
  $('#kGroq').addEventListener('change',()=>saveKey('groq','#kGroq'));
  const saveGemini=()=>{ const ids=['#kGem1','#kGem2','#kGem3','#kGem4']; const cur=geminiKeys();
    setGeminiKeys(ids.map((id,i)=>{ const v=$(id).value; return v.startsWith('••')?(cur[i]||'') : cleanKey(v); })); };
  ['#kGem1','#kGem2','#kGem3','#kGem4'].forEach(id=>$(id).addEventListener('change',saveGemini));
  $('#sPersona').addEventListener('change',e=>{ cfg.persona=e.target.value.trim().slice(0,300); saveCfg(); });
  $('#sPersonaNia').addEventListener('change',e=>{ cfg.personaNia=e.target.value.trim().slice(0,2000); saveCfg(); });
  $('#sPersonaRuby').addEventListener('change',e=>{ cfg.personaRuby=e.target.value.trim().slice(0,2000); saveCfg(); });
  $('#sVoiceNia').addEventListener('change',e=>{ cfg.voiceNia=e.target.value.trim()||null; saveCfg(); });
  $('#sVoiceRuby').addEventListener('change',e=>{ cfg.voiceRuby=e.target.value.trim()||null; saveCfg(); });
  $('#sRate').addEventListener('input',e=>{ cfg.voiceRate=+e.target.value/100; $('#rateNote').textContent=e.target.value+'%'; saveCfg(); });
  $('#sRead').addEventListener('change',e=>{ cfg.readAloud=e.target.checked; saveCfg(); if(!cfg.readAloud) V.stopSpeaking(); });
  $('#sAdult').addEventListener('change',e=>{
    if(e.target.checked){
      if(!confirm('🔞 Modo +18 (solo texto)\n\nConfirmo que tengo 18 años o más y quiero pláticas para adultos. Nada con menores, todo con consentimiento.\n\n¿Tengo 18 años o más?')){ e.target.checked=false; return; }
      cfg.adult=true; cfg.adultAt=Date.now();
    } else cfg.adult=false;
    saveCfg(); syncAdult(); $('#adultBox').style.display=cfg.adult?'block':'none';
  });
  $('#sInt').addEventListener('input',e=>{ const l=getLimits(); l.intensity=+e.target.value; LS.set('bffduo_limits',l); $('#intNote').textContent=e.target.value+'/10'; });
  $('#sMemBtn').addEventListener('click',()=>{ const ml=$('#sMemList'); if(ml.style.display==='none'){ const ms=LS.get('bffduo_memories',[])||[]; ml.innerHTML=ms.length? ms.map(m=>`<p class="note">🗓️ ${new Date(m.t).toLocaleDateString('es-MX')}: ${esc(m.m)}</p>`).join('') : '<p class="note">Todavía no hay recuerdos. Cuando te diga que algo le encantó, lo guardo aquí.</p>'; ml.style.display='block'; } else ml.style.display='none'; });
  $('#sMemDel').addEventListener('click',()=>{ if(!confirm('¿Borrar todas las memorias guardadas?')) return; LS.del('bffduo_memories'); $('#sMemNote').textContent='0 recuerdos guardados.'; });
  $('#sNoList').addEventListener('click',e=>{ const b=e.target.closest('button[data-no]'); if(!b) return; const l=getLimits(); l.no.splice(+b.dataset.no,1); LS.set('bffduo_limits',l); openSettings(); });
  $('#sNoBtn').addEventListener('click',()=>{ const inp=$('#sNoAdd'); const v=inp.value.trim(); if(!v) return; const l=getLimits(); if(!l.no.some(x=>x.toLowerCase()===v.toLowerCase())) l.no.push(v.slice(0,40)); LS.set('bffduo_limits',l); openSettings(); });
  $('#sReset').addEventListener('click',()=>{ if(!confirm('¿Borrar todo el chat y los datos guardados?')) return; ['bffduo_hist','bffduo_profile','bffduo_ucount','bffduo_stats','bffduo_memories','bffduo_limits'].forEach(LS.del); hist=[]; userCount=0; cfg.adult=false; saveCfg(); syncAdult(); el.classList.add('hidden'); render(); intro(); });
  $('#sRegen').addEventListener('click',()=>{ el.classList.add('hidden'); regenerate(); });
  $('#sClose').addEventListener('click',()=>el.classList.add('hidden'));
}
const syncAdult=()=>document.body.classList.toggle('adult',!!cfg.adult);

// ---------- intro: el chat empieza vacio, ellas no empiezan solas ----------
function intro(){
  render();
}
// ---------- boton de voz en la barra ----------
function syncVoiceBtn(){
  const b=$('#voiceBtn'); if(!b) return;
  b.textContent=cfg.readAloud?'🔊':'🔇';
}
function toggleVoice(){
  cfg.readAloud=!cfg.readAloud; saveCfg(); syncVoiceBtn();
  if(cfg.readAloud){
    V.unlockAudio(); refreshAutoVoices();
    V.speak('Hola, soy Nia, ¿me escuchas?',{pitch:1.15,rate:cfg.voiceRate,voiceName:cfg.voiceNia||autoVoices.nia||cfg.sysVoice||null});
  } else V.stopSpeaking();
}
// ---------- videos: un video por personaje, en loop ----------
function bootVideos(){
  const nv=$('#vid-nia'); if(nv) nv.play().catch(()=>{});
  const rv=$('#vid-ruby'); if(rv) rv.play().catch(()=>{});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ nv?.pause(); rv?.pause(); }
    else { nv?.play().catch(()=>{}); rv?.play().catch(()=>{}); }
  });
}
function boot(){
  render(); intro(); syncAdult(); refreshAutoVoices(); syncVoiceBtn(); bootVideos();
  $('#lbarFill').style.width='100%';
  setTimeout(()=>{ $('#loader').classList.add('out'); },400);
  setTimeout(()=>warmModels(),1200);
  if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js?v='+VERSION).catch(()=>{});
  setInterval(()=>{
    const idleMs=Date.now()-lastUserAt;
    if(!nudged && idleMs>=240000 && !busy){ nudged=true; say('Oye, ¿sigues ahi? Te extrañamos 😊'); }
    if(cfg.adult && idleMs>=360000){ nudged=true; proposeScenario(); }
  },30000);
}
$('#sendBtn').addEventListener('click',()=>{ const v=$('#input').value; $('#input').value=''; send(v); });
$('#input').addEventListener('keydown',e=>{ if(e.key==='Enter'){ const v=e.target.value; e.target.value=''; send(v); } });
$('#photoBtn').addEventListener('click',()=>$('#photoInput').click());
$('#photoInput').addEventListener('change',e=>{ const f=e.target.files?.[0]; if(f) sendPhoto(f); e.target.value=''; });
$('#micBtn').addEventListener('click',toggleMic);
$('#voiceBtn').addEventListener('click',toggleVoice);
$('#autoBtn').addEventListener('click',toggleAuto);
$('#settingsBtn').addEventListener('click',openSettings);
$('#dice').addEventListener('click',()=>{ if(!cfg.adult||busy) return; V.unlockAudio(); proposeScenario(); });
$$('#target button').forEach(b=>b.addEventListener('click',()=>{
  $$('#target button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  cfg.target=b.dataset.target; saveCfg();
  push({role:'sys',content:cfg.target==='both'?'Ahora les hablas a las dos 💜❤️':cfg.target==='nia'?'Ahora le hablas a Nia 💜':'Ahora le hablas a Ruby ❤️'});
}));
document.addEventListener('click',e=>{ if(e.target.id==='sheet') $('#sheet').classList.add('hidden'); });
boot();
