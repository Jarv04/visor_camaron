"use strict";
const VENDOR_URL='https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js';
const CACHE_NAME='visor-camaron-offline-v12';
const MODEL_PARTS={"sano":["./camaron_sano_v2_01.bin","./camaron_sano_v2_02.bin","./camaron_sano_v2_03.bin","./camaron_sano_v2_04.bin"],"bol1":["./camaron_bol1_01.bin","./camaron_bol1_02.bin","./camaron_bol1_03.bin","./camaron_bol1_04.bin"],"bol2":["./camaron_bol2_01.bin","./camaron_bol2_02.bin","./camaron_bol2_03.bin","./camaron_bol2_04.bin"],"bol3":["./camaron_bol3_01.bin","./camaron_bol3_02.bin","./camaron_bol3_03.bin","./camaron_bol3_04.bin"],"bof":["./camaron_bof_01.bin","./camaron_bof_02.bin","./camaron_bof_03.bin","./camaron_bof_04.bin"],"mbl":["./camaron_mbl_01.bin","./camaron_mbl_02.bin","./camaron_mbl_03.bin","./camaron_mbl_04.bin"],"mbf":["./camaron_mbf_01.bin","./camaron_mbf_02.bin","./camaron_mbf_03.bin","./camaron_mbf_04.bin"],"mbs":["./camaron_mbs_01.bin","./camaron_mbs_02.bin","./camaron_mbs_03.bin","./camaron_mbs_04.bin"]};
const meta={"bolleve":{"badge":"BOL · Leve","label":"Branquias oscuras leves · 3 ejemplares","desc":"Comparación simultánea de tres ejemplares con oscurecimiento leve de la estructura branquial. Los tres se muestran al mismo tiempo para facilitar la evaluación de variaciones visuales dentro de la categoría leve.","featureTitle":"Qué revisar en BOL leve","feature":"Compara entre los tres ejemplares la intensidad, extensión y distribución del oscurecimiento interno de las branquias. La alteración debe observarse dentro de la caja branquial y no como una mancha externa del caparazón.","status":"Comparación de 3 ejemplares BOL activa"},"sano":{"badge":"Sano","label":"Camarón sano","desc":"Individuo que se observa completamente sin anomalías visibles, con una coloración natural y homogénea, exoesqueleto íntegro y estructura corporal conservada. No presenta alteraciones evidentes en branquias, boca, abdomen, cola ni apéndices.","featureTitle":"Características visuales esperadas","feature":"Coloración natural grisácea a translúcida, superficie uniforme, segmentos definidos, apéndices íntegros y ausencia de manchas oscuras, lesiones, picado o signos visibles de muda.","status":"Modelo base activo"},"bol1":{"badge":"BOL 1","label":"Branquias oscuras leves · Ejemplar 1","desc":"Individuo con oscurecimiento leve de la estructura branquial. La alteración se aprecia de forma interna y localizada en la zona branquial, manteniendo la coloración natural del resto del camarón.","featureTitle":"Qué revisar en BOL","feature":"Oscurecimiento leve, difuso y localizado en las branquias. El cambio debe observarse dentro de la caja branquial y no como una mancha externa del caparazón.","status":"Modelo BOL 1 activo"},"bol2":{"badge":"BOL 2","label":"Branquias oscuras leves · Ejemplar 2","desc":"Individuo con oscurecimiento leve de la estructura branquial. La alteración se aprecia de forma interna y localizada en la zona branquial, manteniendo la coloración natural del resto del camarón.","featureTitle":"Qué revisar en BOL","feature":"Oscurecimiento leve, difuso y localizado en las branquias. El cambio debe observarse dentro de la caja branquial y no como una mancha externa del caparazón.","status":"Modelo BOL 2 activo"},"bol3":{"badge":"BOL 3","label":"Branquias oscuras leves · Ejemplar 3","desc":"Individuo con oscurecimiento leve de la estructura branquial. La alteración se aprecia de forma interna y localizada en la zona branquial, manteniendo la coloración natural del resto del camarón.","featureTitle":"Qué revisar en BOL","feature":"Oscurecimiento leve, difuso y localizado en las branquias. El cambio debe observarse dentro de la caja branquial y no como una mancha externa del caparazón.","status":"Modelo BOL 3 activo"},"bof":{"badge":"BOF","label":"Camarón con branquias oscuras fuertes","desc":"Individuo con oscurecimiento marcado de la estructura branquial. La alteración es más intensa y extensa que en BOL, manteniendo sin cambios la coloración natural del resto del camarón.","featureTitle":"Qué revisar en BOF","feature":"Oscurecimiento fuerte, evidente y de mayor extensión en la estructura branquial, sin confundirlo con pigmentación externa del caparazón ni con el hepatopáncreas.","status":"Modelo BOF activo"},"mbl":{"badge":"Mancha bucal leve","label":"Camarón con mancha bucal leve","desc":"Individuo que presenta una mancha de tonalidad marrón oscura, leve y localizada en la región bucal, con menor intensidad y extensión que en la condición fuerte.","featureTitle":"Qué revisar en mancha bucal leve","feature":"Oscurecimiento discreto y concentrado en la región bucal; observar la intensidad y el área de la mancha sin confundirla con pigmentación de otras estructuras.","status":"Modelo de mancha bucal leve activo"},"mbf":{"badge":"Mancha bucal fuerte","label":"Camarón con mancha bucal fuerte","desc":"Individuo que presenta una mancha oscura de mayor intensidad y extensión en la región bucal en comparación con el grado leve.","featureTitle":"Qué revisar en mancha bucal fuerte","feature":"Oscurecimiento marcado y más extendido en la región bucal; distinguirlo de la pigmentación de branquias u otras zonas del cefalotórax.","status":"Modelo de mancha bucal fuerte activo"},"mbs":{"badge":"Mancha bucal sana","label":"Camarón sano · Mancha Bucal","desc":"Ejemplar de referencia sin mancha bucal evidente. Se utiliza para comparar visualmente la región bucal con las condiciones leve y fuerte.","featureTitle":"Qué revisar en mancha bucal sana","feature":"Ausencia de oscurecimiento anormal localizado en la región bucal. Compara esta zona con las muestras de mancha bucal leve y fuerte.","status":"Modelo sano de mancha bucal activo"}};
const $=id=>document.getElementById(id);
const viewer=$('viewer'), loading=$('loading'), multiGrid=$('multiViewerGrid');
const multiViewers=[['bol1',$('viewerBol1')],['bol2',$('viewerBol2')],['bol3',$('viewerBol3')]];
let selected='sano', selectedGroup='branquias', auto=false, preparing=false, loadingSeq=0, currentBlobUrl=null, multiMode=false;
let multiBlobUrls=[];
const ANCHO_NUEVOS=1.5, MODELOS_ANCHOS=['sano','bol1','bol2','bol3'];
const scaleFor=key=>MODELOS_ANCHOS.includes(key)?`${ANCHO_NUEVOS} ${(1+(ANCHO_NUEVOS-1)*0.2).toFixed(3)} 1`:'1 1 1';
const partUrl=path=>new URL(path,location.href).href;
const allPartUrls=()=>Object.values(MODEL_PARTS).flat().map(partUrl);

async function fetchPart(path){
 const url=partUrl(path), cache=await caches.open(CACHE_NAME);
 let response=await cache.match(url);
 if(!response){response=await fetch(url);if(!response.ok)throw new Error('No se pudo recuperar '+path);}
 return await response.arrayBuffer();
}
async function buildModelUrl(key,seq){
 const chunks=[], paths=MODEL_PARTS[key];
 for(let i=0;i<paths.length;i++){
  if(seq!==loadingSeq)return null;
  loading.textContent=`Preparando ${meta[key].badge} (${i+1}/${paths.length})…`;
  chunks.push(await fetchPart(paths[i]));
 }
 if(seq!==loadingSeq)return null;
 return URL.createObjectURL(new Blob(chunks,{type:'model/gltf-binary'}));
}
function revokeUrl(url){if(url)try{URL.revokeObjectURL(url)}catch(e){}}
function clearSingle(){
 revokeUrl(currentBlobUrl);currentBlobUrl=null;
 viewer.removeAttribute('src');
}
function clearMulti(){
 for(const url of multiBlobUrls)revokeUrl(url);
 multiBlobUrls=[];
 for(const [,v] of multiViewers)v.removeAttribute('src');
}
function showSingle(){
 multiMode=false;multiGrid.hidden=true;viewer.hidden=false;
 viewer.closest('.viewerWrap').classList.remove('multiMode');
}
function showMulti(){
 multiMode=true;viewer.hidden=true;multiGrid.hidden=false;
 viewer.closest('.viewerWrap').classList.add('multiMode');
}
function waitViewer(target){
 return new Promise((resolve,reject)=>{
  const ok=()=>{cleanup();resolve()};
  const bad=()=>{cleanup();reject(new Error('No fue posible renderizar uno de los modelos 3D.'))};
  const cleanup=()=>{target.removeEventListener('load',ok);target.removeEventListener('error',bad)};
  target.addEventListener('load',ok,{once:true});target.addEventListener('error',bad,{once:true});
 });
}
async function loadSingleModel(key,seq){
 showSingle();clearMulti();
 const url=await buildModelUrl(key,seq);if(!url||seq!==loadingSeq){revokeUrl(url);return}
 const previous=currentBlobUrl;currentBlobUrl=url;
 viewer.scale=scaleFor(key);viewer.exposure=MODELOS_ANCHOS.includes(key)?.72:.66;viewer.autoRotate=auto;viewer.src=url;
 try{await waitViewer(viewer)}finally{if(previous&&previous!==url)revokeUrl(previous)}
 if(seq!==loadingSeq)return;
 if(viewer.updateFraming)viewer.updateFraming();
 ajustarMateriales(viewer);
 setOrbit('0deg 75deg 115%');
}
async function loadBOLTriple(seq){
 showMulti();clearSingle();clearMulti();
 const created=[];
 try{
  for(let i=0;i<multiViewers.length;i++){
   const [key,target]=multiViewers[i];
   if(seq!==loadingSeq)break;
   loading.textContent=`Preparando Leve · ejemplar ${i+1} de 3…`;
   const url=await buildModelUrl(key,seq);if(!url||seq!==loadingSeq){revokeUrl(url);break}
   created.push(url);multiBlobUrls.push(url);
   target.scale=scaleFor(key);target.exposure=.72;target.autoRotate=auto;target.src=url;
   await waitViewer(target);
   if(target.updateFraming)target.updateFraming();
   ajustarMateriales(target);
   target.cameraOrbit=lastOrbit;if(target.jumpCameraToGoal)target.jumpCameraToGoal();
  }
 }catch(error){
  for(const url of created)revokeUrl(url);
  multiBlobUrls=[];throw error;
 }
}


// Al ensanchar el sano, model-viewer aleja la cámara (encuadra la caja más ancha) y el efecto se pierde.
// Se compensa la distancia para que el largo del camarón ocupe lo mismo en pantalla.
let radiusFactor=1, lastOrbit='0deg 75deg 115%';
function compensate(v){return radiusFactor===1?v:String(v).replace(/([\d.]+)%/,(m,n)=>(parseFloat(n)*radiusFactor).toFixed(1)+'%')}
function setOrbit(v){
 lastOrbit=v;
 if(multiMode){
  for(const [,target] of multiViewers){target.cameraOrbit=v;if(target.jumpCameraToGoal)target.jumpCameraToGoal();}
 }else{viewer.cameraOrbit=compensate(v);if(viewer.jumpCameraToGoal)viewer.jumpCameraToGoal();}
}
function ajustarMateriales(target=viewer){
 try{if(!target.model||!target.model.materials)return;
  for(const mat of target.model.materials){const pbr=mat.pbrMetallicRoughness;if(!pbr)continue;
   try{pbr.setMetallicFactor(0)}catch(e){};
   try{pbr.setRoughnessFactor(1)}catch(e){};
   try{pbr.setBaseColorFactor([.95,.95,.95,1])}catch(e){};
   try{mat.setDoubleSided(true)}catch(e){};
   try{if(mat.emissiveFactor)mat.setEmissiveFactor([0,0,0])}catch(e){};
  }
 }catch(e){}
}
function failLoading(text){loading.classList.remove('hidden');loading.textContent=text;}
async function isModelSaved(key){
 try{
  const cache=await caches.open(CACHE_NAME);
  const keys=key==='bolleve'?['bol1','bol2','bol3']:[key];
  for(const k of keys)for(const path of MODEL_PARTS[k]||[])if(!(await cache.match(partUrl(path))))return false;
  return true;
 }catch{return false}
}
async function setCondition(key,group="branquias"){
 if(!meta[key])return;
 selected=key;selectedGroup=group;
 const seq=++loadingSeq, m=meta[key];
 $('modelLabel').textContent=m.label;
 $('infoName').textContent=m.label;
 $('description').textContent=m.desc;
 $('featureTitle').textContent=m.featureTitle;
 $('featureText').textContent=m.feature;
 $('statusText').textContent=m.status;
 document.querySelectorAll('.severityBtn[data-key]').forEach(b=>{const isActive=b.dataset.key===key&&b.dataset.group===group;b.classList.toggle('active',isActive);b.setAttribute('aria-pressed',String(isActive));});
 failLoading(key==='bolleve'?'Preparando comparación de 3 ejemplares…':'Cargando modelo 3D…');
 if(!navigator.onLine && !(await isModelSaved(key)) && key===selected){
  failLoading('Este modelo no está guardado. Conéctate y pulsa “Guardar modelos”.');return;
 }
 try{
  if(key==='bolleve')await loadBOLTriple(seq);
  else await loadSingleModel(key,seq);
  if(seq===loadingSeq)loading.classList.add('hidden');
 }catch(error){
  console.error(error);
  if(seq===loadingSeq)failLoading('No se pudo abrir este modelo: '+error.message);
 }
}

document.querySelectorAll('.severityBtn[data-key]:not([disabled])').forEach(b=>b.addEventListener('click',()=>setCondition(b.dataset.key,b.dataset.group)));
document.querySelectorAll('[data-orbit]').forEach(b=>b.addEventListener('click',()=>setOrbit(b.dataset.orbit)));
$('autoBtn').addEventListener('click',()=>{
 auto=!auto;
 if(multiMode){for(const [,target] of multiViewers)target.autoRotate=auto}else viewer.autoRotate=auto;
 $('autoBtn').textContent=auto?'Ⅱ Detener giro':'↻ Girar solo';
});
$('resetBtn').addEventListener('click',()=>setOrbit('0deg 75deg 115%'));

function setOfflineMessage(text){$('offlineMessage').textContent=text;}
function setProgress(done,total,text){
 $('progressArea').hidden=false;
 $('progressBar').style.width=`${Math.round(100*done/total)}%`;
 $('progressText').textContent=text;
}
// Borra del almacenamiento las partes de modelos que ya no forman parte de la app (p. ej., el sano anterior).
async function pruneOldParts(){
 try{const c=await caches.open(CACHE_NAME);const keep=new Set([VENDOR_URL,...allPartUrls()]);
  for(const req of await c.keys()){if(!keep.has(req.url))await c.delete(req);}
 }catch(e){console.warn('Limpieza de modelos antiguos:',e)}
}
async function offlineStatus(){
 if(!('caches' in window)||!('serviceWorker' in navigator)){
  $('offlineBadge').textContent='No compatible';setOfflineMessage('Este navegador no permite almacenar el visor como PWA. Abre el enlace HTTPS en Safari.');return false;
 }
 const c=await caches.open(CACHE_NAME);
 const all=(await Promise.all([VENDOR_URL,...allPartUrls()].map(url=>c.match(url)))).every(Boolean);
 const controlled=Boolean(navigator.serviceWorker.controller);
 const ready=all&&controlled;
 $('offlineBadge').textContent=ready?'Disponible sin conexión':all?'Preparando aplicación':'Pendiente';
 $('offlineBadge').classList.toggle('ready',ready);
 $('headerStatus').textContent=ready?'✓ Sin conexión lista':navigator.onLine?'● Con conexión':'● Sin conexión';
 if(ready){
  $('downloadOffline').textContent='✓ Modelos guardados · Verificar';
  setOfflineMessage('Todos los modelos y el motor 3D están guardados. Puedes probar el modo avión desde la aplicación instalada.');
 }else if(all&&!controlled){
  setOfflineMessage('Los modelos están guardados. Cierra y vuelve a abrir la app instalada para activar el acceso sin conexión.');
 }
 return ready;
}
async function saveOffline(){
 if(preparing)return;
 if(location.protocol!=='https:' && location.hostname!=='localhost' && location.hostname!=='127.0.0.1'){
  setOfflineMessage('Para instalar la PWA y guardar sus modelos debes abrirla desde una dirección HTTPS, no desde Archivos.');return;
 }
 if(!navigator.onLine){setOfflineMessage('Necesitas Internet para completar la descarga inicial de los modelos.');return;}
 if(!('caches' in window) || !('serviceWorker' in navigator)){setOfflineMessage('El navegador no admite la instalación sin conexión.');return;}
 preparing=true;$('downloadOffline').disabled=true;
 const all=[{url:VENDOR_URL,name:'Motor 3D'},...Object.entries(MODEL_PARTS).flatMap(([key,paths])=>paths.map((path,i)=>({url:partUrl(path),name:`${meta[key].badge} (${i+1}/${paths.length})` })))];
 const total=all.length;let done=0;
 try{
  const reg=await navigator.serviceWorker.ready;
  if(!reg.active)throw new Error('El controlador offline aún no se ha activado.');
  const cache=await caches.open(CACHE_NAME);
  for(const item of all){
   setProgress(done,total,`Guardando ${item.name} (${done+1}/${total})… Mantén esta pantalla abierta.`);
   if(!(await cache.match(item.url))){
    const res=await fetch(item.url,{mode:'cors',cache:'reload'});
    if(!res.ok || res.type==='opaque')throw new Error('La descarga de '+item.name+' no está disponible.');
    await cache.put(item.url,res);
   }
   if(!(await cache.match(item.url)))throw new Error('No se pudo guardar '+item.name);
   done++;setProgress(done,total,`Guardado: ${item.name} (${done}/${total}).`);
  }
  await offlineStatus();
 }catch(error){
  console.error('Preparación offline:',error);
  setOfflineMessage('Descarga incompleta: '+error.message+' Libera espacio, usa Wi-Fi y vuelve a pulsar el botón. Los archivos ya guardados se conservan.');
  $('offlineBadge').textContent='Incompleto';
 }finally{preparing=false;$('downloadOffline').disabled=false;}
}
$('downloadOffline').addEventListener('click',saveOffline);
window.addEventListener('online',offlineStatus);window.addEventListener('offline',offlineStatus);
async function start(){
 if(location.protocol==='file:')setOfflineMessage('Este archivo no se instala desde Archivos. Publica la carpeta en HTTPS y abre el enlace en Safari.');
 if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  try{
   const hadController=!!navigator.serviceWorker.controller;
   // Cuando se publica una versión nueva, recarga una sola vez para usarla de inmediato.
   let reloaded=false;
   navigator.serviceWorker.addEventListener('controllerchange',()=>{if(hadController&&!reloaded){reloaded=true;location.reload();}});
   const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
   try{await reg.update()}catch(e){}
   navigator.serviceWorker.addEventListener('controllerchange',offlineStatus);
  }catch(err){setOfflineMessage('No se pudo activar el acceso sin conexión: '+err.message);}
 }
 await pruneOldParts();
 try{await offlineStatus()}catch(e){console.warn(e)};
 try{
  await Promise.race([customElements.whenDefined('model-viewer'),new Promise((_,rej)=>setTimeout(()=>rej(new Error('motor')),30000))]);
  await setCondition('sano');
 }catch(e){failLoading('El motor 3D no se pudo cargar. Necesitas Internet la primera vez; comprueba la conexión y vuelve a abrir la aplicación.');}
}
start();
