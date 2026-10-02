import './style.css';
import './polish.css';
import './book.js';
import './editorial.css';
import './night.js';
import './language.js';
import './navigation.js';
import './rag.js';
import './background.css';
import { publishedImages } from './images.js';
import {campCarousel} from './experience-view.js';
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
});
const profileDialog=document.querySelector('#profile-dialog');
document.querySelectorAll('#open-profile,[data-open-profile]').forEach(button=>button.addEventListener('click',()=>profileDialog.showModal()));
document.querySelectorAll('[data-close-profile]').forEach(link=>link.addEventListener('click',()=>profileDialog.close()));
document.querySelectorAll('[data-lens]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('.personal-atlas').dataset.mode=button.dataset.lens;
}));
// Reading progress is the actual scrolled fraction of the available document.
const progress=document.querySelector('.reading-progress span');
let scrollQueued=false;
function updateProgress(){const available=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${available>0?Math.min(1,Math.max(0,scrollY/available)):0})`;scrollQueued=false;}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});
addEventListener('resize',updateProgress);updateProgress();
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('nav a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-20% 0px -60% 0px'});
document.querySelectorAll('#story,#about,#work,#journey').forEach(section=>sectionObserver.observe(section));
// Motion is on by default; the operating system's accessibility preference
// continues to apply through each animation's reduced-motion handling.
document.body.classList.remove('motion-off');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:0.1});
document.querySelectorAll('.work-heading,.project,.journey-intro,.manifesto p,.connect h2').forEach(el=>{el.classList.add('reveal');observer.observe(el);});

// Optional public images take precedence over device-only uploads.
const imageDialog=document.querySelector('#image-dialog'),status=document.querySelector('#upload-status');
document.querySelector('#open-editor').addEventListener('click',()=>imageDialog.showModal());
const dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('yc-images',1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
function storeImage(key,blob){return dbPromise.then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);}));}
const activeUrls=new Map();
function showImage(key,url){if(activeUrls.has(key))URL.revokeObjectURL(activeUrls.get(key));if(url.startsWith('blob:'))activeUrls.set(key,url);if(key==='camp'){campCarousel.setPreviewImage(url);return;}const image=document.querySelector(`[data-image="${key}"]`);image.src=url;image.hidden=false;}
for(const [key,url] of Object.entries(publishedImages)){
 const loadLocal=async()=>{try{const db=await dbPromise;const req=db.transaction('images').objectStore('images').get(key);req.onsuccess=()=>{if(req.result)showImage(key,URL.createObjectURL(req.result));};}catch{/* Upload preview remains available without persistence. */}};
 if(url){const probe=new Image();probe.onload=()=>showImage(key,url);probe.onerror=loadLocal;probe.src=url;}else loadLocal();
}
document.querySelectorAll('[data-upload]').forEach(input=>input.addEventListener('change',async()=>{
 const file=input.files?.[0];if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){status.textContent='請選擇 PNG、JPEG 或 WebP 圖片。';return;}
 try{const bitmap=await createImageBitmap(file);bitmap.close();showImage(input.dataset.upload,URL.createObjectURL(file));try{await storeImage(input.dataset.upload,file);status.textContent='圖片已儲存在此裝置。公開網站圖片請依 README 設定。';}catch{status.textContent='圖片已預覽；此瀏覽器無法儲存圖片，重新整理後需再選擇。';}}catch{status.textContent='無法讀取這張圖片，請換一個檔案。';}
}));
document.querySelector('#reset-images').addEventListener('click',async()=>{try{const db=await dbPromise;await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').clear();tx.oncomplete=resolve;tx.onerror=reject;});status.textContent='已清除本機圖片。';location.reload();}catch{status.textContent='無法清除儲存資料，請使用瀏覽器的網站資料設定。';}});

import './editorial-copy.js';
import './personality.js';
import './about-profile.css';

import './layout-refinements.css';
