const C='sewa-akta-v1.5';
const APP=['./','./index.html','./style.css','./app.js','./manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(APP)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // Never intercept Supabase/CDN/API traffic. Let the browser handle it directly.
  if(u.origin!==self.location.origin || e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html'))));
});
