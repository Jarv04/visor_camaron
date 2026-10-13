"use strict";
const VENDOR_URL='https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js';
const CACHE_NAME='visor-camaron-offline-v12';
const MODEL_PARTS={"sano":["./camaron_sano_01.bin","./camaron_sano_02.bin"],"bol":["./camaron_bol_01.bin","./camaron_bol_02.bin","./camaron_bol_03.bin","./camaron_bol_04.bin"],"bof":["./camaron_bof_01.bin","./camaron_bof_02.bin","./camaron_bof_03.bin","./camaron_bof_04.bin"],"mbl":["./camaron_mbl_01.bin","./camaron_mbl_02.bin","./camaron_mbl_03.bin","./camaron_mbl_04.bin"],"mbf":["./camaron_mbf_01.bin","./camaron_mbf_02.bin","./camaron_mbf_03.bin","./camaron_mbf_04.bin"],"mbs":["./camaron_mbs_01.bin","./camaron_mbs_02.bin","./camaron_mbs_03.bin","./camaron_mbs_04.bin"]};
const meta={"sano":{"badge":"Sano","label":"Camarón sano","desc":"Individuo que se observa completamente sin anomalías visibles, con una coloración natural y homogénea, exoesqueleto íntegro y estructura corporal conservada. No presenta alteraciones evidentes en branquias, boca, abdomen, cola ni apéndices.","featureTitle":"Características visuales esperadas","feature":"Coloración natural grisácea a translúcida, superficie uniforme, segmentos definidos, apéndices íntegros y ausencia de manchas oscuras, lesiones, picado o signos visibles de muda.","status":"Modelo base activo"},"bol":{"badge":"BOL","label":"Camarón con branquias oscuras leves","desc":"Individuo con oscurecimiento leve de la estructura branquial. La alteración se aprecia de forma interna y localizada en la zona branquial, manteniendo la coloración natural del resto del camarón.","featureTitle":"Qué revisar en BOL","feature":"Oscurecimiento leve, difuso y localizado en las branquias. El cambio debe observarse dentro de la caja branquial y no como una mancha externa del caparazón.","status":"Modelo BOL activo"},"bof":{"badge":"BOF","label":"Camarón con branquias oscuras fuertes","desc":"Individuo con oscurecimiento marcado de la estructura branquial. La alteración es más intensa y extensa que en BOL, manteniendo sin cambios la coloración natural del resto del camarón.","featureTitle":"Qué revisar en BOF","feature":"Oscurecimiento fuerte, evidente y de mayor extensión en la estructura branquial, sin confundirlo con pigmentación externa del caparazón ni con el hepatopáncreas.","status":"Modelo BOF activo"},"mbl":{"badge":"Mancha bucal leve","label":"Camarón con mancha bucal leve","desc":"Individuo que presenta una mancha de tonalidad marrón oscura, leve y localizada en la región bucal, con menor intensidad y extensión que en la condición fuerte.","featureTitle":"Qué revisar en mancha bucal leve","feature":"Oscurecimiento discreto y concentrado en la región bucal; observar la intensidad y el área de la mancha sin confundirla con pigmentación de otras estructuras.","status":"Modelo de mancha bucal leve activo"},"mbf":{"badge":"Mancha bucal fuerte","label":"Camarón con mancha bucal fuerte","desc":"Individuo que presenta una mancha oscura de mayor intensidad y extensión en la región bucal en comparación con el grado leve.","featureTitle":"Qué revisar en mancha bucal fuerte","feature":"Oscurecimiento marcado y más extendido en la región bucal; distinguirlo de la pigmentación de branquias u otras zonas del cefalotórax.","status":"Modelo de mancha bucal fuerte activo"},"mbs":{"badge":"Mancha bucal sana","label":"Camarón sano · Mancha Bucal","desc":"Ejemplar de referencia sin mancha bucal evidente. Se utiliza para comparar visualmente la región bucal con las condiciones leve y fuerte.","featureTitle":"Qué revisar en mancha bucal sana","feature":"Ausencia de oscurecimiento anormal localizado en la región bucal. Compara esta zona con las muestras de mancha bucal leve y fuerte.","status":"Modelo sano de mancha bucal activo"}};
const $=id=>document.getElementById(id);
const viewer=$('viewer'), loading=$('loading');
let selected='sano', selectedGroup='branquias', auto=false, preparing=false, loadingSeq=0, currentBlobUrl=null;
const partUrl=path=>new URL(path,location.href).href;
const allPartUrls=()=>Object.values(MODEL_PARTS).flat().map(partUrl);

// Reconstrucción exacta de un GLB en memoria, solo cuando se selecciona.
// Los 18 fragmentos no alteran la geometría, las texturas ni la resolución.
async function fetchPart(path){
 const url=partUrl(path), cache=await caches.open(CACHE_NAME);
 let response=await cache.match(url);
 if(!response){response=await fetch(url);if(!response.ok)throw new Error('No se pudo recuperar '+path);}
 return await response.arrayBuffer();
}
async function loadModel(key,seq){
 const chunks=[];const paths=MODEL_PARTS[key];
 for(let i=0;i<paths.length;i++){
  if(seq!==loadingSeq)return;
  loading.textContent=`Preparando ${meta[key].badge} (${i+1}/${paths.length})…`;
  chunks.push(await fetchPart(paths[i]));
 }
 if(seq!==loadingSeq)return;
 const blob=new Blob(chunks,{type:'model/gltf-binary'});
 const url=URL.createObjectURL(blob);
 const previous=currentBlobUrl;
 currentBlobUrl=url;
 viewer.src=url;
 setOrbit('0deg 75deg 115%');
 // El modelo anterior se libera cuando el nuevo terminó de cargar.
 const cleanup=()=>{if(previous)URL.revokeObjectURL(previous)};
 viewer.addEventListener('load',cleanup,{once:true});
 viewer.addEventListener('error',cleanup,{once:true});
}


function setOrbit(v){viewer.cameraOrbit=v;if(viewer.jumpCameraToGoal)viewer.jumpCameraToGoal();}
function ajustarMateriales(){
 try{if(!viewer.model||!viewer.model.materials)return;
  for(const mat of viewer.model.materials){const pbr=mat.pbrMetallicRoughness;if(!pbr)continue;
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
 try{const cache=await caches.open(CACHE_NAME);
  for(const path of MODEL_PARTS[key])if(!(await cache.match(partUrl(path))))return false;
  return true;
 }catch{return false}
}
async function setCondition(key,group="branquias"){
 if(!meta[key])return;
 selected=key;selectedGroup=group;
 const seq=++loadingSeq;
 const m=meta[key];
 $('modelLabel').textContent=m.label;
 $('infoName').textContent=m.label;
 $('description').textContent=m.desc;
 $('featureTitle').textContent=m.featureTitle;
 $('featureText').textContent=m.feature;
 $('statusText').textContent=m.status;
 document.querySelectorAll('.severityBtn[data-key]').forEach(b=>{const isActive=b.dataset.key===key&&b.dataset.group===group;b.classList.toggle('active',isActive);b.setAttribute('aria-pressed',String(isActive));});
 viewer.exposure=key==='sano'?.72:.66;
 failLoading('Cargando modelo 3D…');
 if(!navigator.onLine && !(await isModelSaved(key)) && key===selected){
  failLoading('Este modelo no está guardado. Conéctate y pulsa “Guardar modelos”.');return;
 }
 try{await loadModel(key,seq)}catch(error){
  console.error(error);
  if(seq===loadingSeq)failLoading('No se pudo abrir este modelo: '+error.message);
 }

}
viewer.addEventListener('load',()=>{loading.classList.add('hidden');ajustarMateriales()});
viewer.addEventListener('error',()=>{failLoading(navigator.onLine?'No fue posible renderizar este modelo 3D. Revisa tu conexión y la memoria disponible.':'El modelo no está disponible sin conexión. Comprueba que esté descargado.');});
document.querySelectorAll('.severityBtn[data-key]:not([disabled])').forEach(b=>b.addEventListener('click',()=>setCondition(b.dataset.key,b.dataset.group)));
document.querySelectorAll('[data-orbit]').forEach(b=>b.addEventListener('click',()=>setOrbit(b.dataset.orbit)));
$('autoBtn').addEventListener('click',()=>{auto=!auto;viewer.autoRotate=auto;$('autoBtn').textContent=auto?'Ⅱ Detener giro':'↻ Girar solo'});
$('resetBtn').addEventListener('click',()=>setOrbit('0deg 75deg 115%'));

function setOfflineMessage(text){$('offlineMessage').textContent=text;}
function setProgress(done,total,text){
 $('progressArea').hidden=false;
 $('progressBar').style.width=`${Math.round(100*done/total)}%`;
 $('progressText').textContent=text;
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
   await navigator.serviceWorker.register('./sw.js',{scope:'./'});
   navigator.serviceWorker.addEventListener('controllerchange',offlineStatus);
  }catch(err){setOfflineMessage('No se pudo activar el acceso sin conexión: '+err.message);}
 }
 try{await offlineStatus()}catch(e){console.warn(e)};
 try{
  await Promise.race([customElements.whenDefined('model-viewer'),new Promise((_,rej)=>setTimeout(()=>rej(new Error('motor')),30000))]);
  await setCondition('sano');
 }catch(e){failLoading('El motor 3D no se pudo cargar. Necesitas Internet la primera vez; comprueba la conexión y vuelve a abrir la aplicación.');}
}
start();
