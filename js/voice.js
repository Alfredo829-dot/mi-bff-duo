// Mi BFF Duo — voz: speechSynthesis del sistema (sin descargar modelos).
// Nia usa pitch mas alto, Ruby mas bajo. Sin archivos de voz, sin clips.
let audioCtx=null, analyser=null, level=0, speaking=false;
export function unlockAudio(){
  try{
    if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
  }catch{}
}
export function audioLevel(){ return level; }
export function isSpeaking(){ return speaking || speechSynthesis.speaking; }
export function stopSpeaking(){ try{ speechSynthesis.cancel(); }catch{} speaking=false; level=0; }
export function listVoices(){ try{ return speechSynthesis.getVoices(); }catch{ return []; } }
export function speak(text, opts={}){
  // opts: {pitch, rate, voiceName}
  if(!text || !('speechSynthesis' in window)) return false;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(text).slice(0,600));
    u.lang='es-MX'; u.rate=opts.rate||1; u.pitch=opts.pitch||1;
    if(opts.voiceName){
      const v=listVoices().find(v=>v.name===opts.voiceName);
      if(v) u.voice=v;
    }
    speaking=true; level=0.5;
    // Nivel simulado suave para animar la boca / brillo al hablar.
    const t0=Date.now();
    const iv=setInterval(()=>{ level = speaking ? 0.35+Math.random()*0.6 : 0; if(Date.now()-t0>9000){ clearInterval(iv); } },90);
    u.onend=()=>{ speaking=false; level=0; clearInterval(iv); if(opts.onEnd) opts.onEnd(); };
    u.onerror=()=>{ speaking=false; level=0; clearInterval(iv); if(opts.onEnd) opts.onEnd(); };
    speechSynthesis.speak(u);
    return true;
  }catch{ speaking=false; return false; }
}
// Reconocimiento de voz (donde el navegador lo permite).
export function createRecognizer(onResult, onEnd){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) return null;
  const r=new SR(); r.lang='es-MX'; r.interimResults=false; r.continuous=false;
  r.onresult=e=>{ const t=e.results?.[0]?.[0]?.transcript||''; if(t && onResult) onResult(t); };
  r.onend=()=>{ if(onEnd) onEnd(); };
  r.onerror=()=>{ if(onEnd) onEnd(); };
  return r;
}
