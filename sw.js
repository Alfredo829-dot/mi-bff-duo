// Mi BFF Duo — service worker. Version unica: la pone app.js al registrar (sw.js?v=VERSION).
// Sin videos, sin clips, sin poses viejas: solo la app y las dos fotos.
const VER=new URL(location.href).searchParams.get('v')||'dev';
const V='bffduo-'+VER;
const SHELL=['./','index.html','css/app.css','js/app.js','js/ai.js','js/voice.js','manifest.webmanifest',
  'img/nia.jpg','img/ruby.jpg'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
const put=(req,res)=>{ if(res&&res.ok&&res.status===200){ const c=res.clone(); caches.open(V).then(x=>x.put(req,c)); } return res; };
self.addEventListener('fetch',e=>{
  const req=e.request, u=new URL(req.url); if(req.method!=='GET'||req.headers.has('range')) return;
  const same=u.origin===location.origin, lib=/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com/.test(u.host);
  if(!same&&!lib) return;
  if(same && (u.pathname.endsWith('/')||/\.(html|js|css|webmanifest)$/.test(u.pathname))){
    e.respondWith(fetch(req).then(r=>put(req,r)).catch(()=>caches.match(req))); return; }
  if(lib){ e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>put(req,r)))); return; }
  e.respondWith(caches.open(V).then(c=>c.match(req).then(m=>{
    const net=fetch(req).then(r=>put(req,r)).catch(()=>m);
    if(m){ e.waitUntil(net); return m; } return net; })));
});
