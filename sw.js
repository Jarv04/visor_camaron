/* Visor Camarón PWA V20. Recursos guardados bajo la misma versión que app.js. */
'use strict';
const CACHE_NAME='visor-camaron-shell-v20';
const MODEL_CACHE='visor-camaron-offline-v12';
const SHELL=['./','./index.html','./app.js','./styles.css','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event=>{
 event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})));await self.skipWaiting();})());
});
self.addEventListener('activate', event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('visor-camaron-shell-')&&k!==CACHE_NAME).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 const belongs=url.origin===self.location.origin&&url.pathname.startsWith(new URL(self.registration.scope).pathname);
 const engine=url.href==='https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js';
 if(!belongs&&!engine)return;
 const shellFile=belongs&&(req.mode==='navigate'||SHELL.some(s=>new URL(s,self.registration.scope).pathname===url.pathname));
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  // Interfaz: primero la red (siempre la última versión); sin conexión, la copia guardada.
  if(shellFile){
   try{
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),5000);
    const fresh=await fetch(url.origin+url.pathname,{cache:'no-cache',signal:ctrl.signal});clearTimeout(timer);
    if(fresh.ok){try{await cache.put(req.mode==='navigate'?'./index.html':url.origin+url.pathname,fresh.clone())}catch(e){}return fresh;}
   }catch(e){}
   const saved=await cache.match(req.mode==='navigate'?'./index.html':req,{ignoreSearch:true});
   if(saved)return saved;
  }
  const match=await cache.match(req,{ignoreSearch:true});
  if(match)return match;
  const previous=await caches.open(MODEL_CACHE);
  const existing=await previous.match(req,{ignoreSearch:true});
  if(existing)return existing;
  try{
   const response=await fetch(req);
   // Engine can be cached automatically after a first controlled load.
   // 3D models are cached only by the explicit download button to prevent quota surprises.
   if(engine&&response.ok&&response.type!=='opaque'){
    try{await cache.put(req,response.clone())}catch(e){console.warn('No se pudo guardar el motor 3D:',e)}
   }
   return response;
  }catch(error){
   if(req.mode==='navigate'){
    const fallback=await cache.match('./index.html');if(fallback)return fallback;
   }
   return Response.error();
  }
 })());
});
