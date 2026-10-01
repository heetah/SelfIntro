import './style.css';
import './polish.css';
import './book.js';
import './editorial.css';
import './night.js';
import './language.js';
import './navigation.js';
import { publishedImages } from './images.js';

const timeline = [
 {year:'2026', title:'CloudMile', role:'藍色種子計畫 · GenAI Intern', type:'tech', body:'以生成式 AI 實習生的角色，延續資訊工程領域的學習。履歷尚未提供實習專案細節，待後續補充。'},
 {year:'2025', title:'中正資工營', role:'總召集人 · 技術開發組組長 · 香舞教練', type:'people', body:'在活動籌備中同時承擔統籌、技術開發與教學角色。'},
 {year:'114-1', title:'中正資工系學會', role:'第 33 屆副會長', type:'people', body:'以系學會副會長的角色參與校園事務，同期也加入臺南返鄉服務隊。'},
 {year:'2025', title:'軟體工程專案', role:'Team Leader', type:'tech', body:'擔任軟體工程團隊組長。具體專案成果與技術內容待補充。'},
 {year:'113-2', title:'AIESEC in CCU', role:'International Relationship', type:'people', body:'代表中正大學分會與海外友會舉行線上文化交流，審核、面試外國志工，接洽雲嘉地區學校，並帶領來台志工認識環境、保持聯繫。'},
 {year:'113-2', title:'Sliding', role:'六人遊戲開發團隊 · 組長', type:'tech', body:'在程式設計（二）期末專案中，帶領六人團隊完成彈跳遊戲 Sliding，設計逾 20 個關卡、超過 5 位角色，以及無限關卡與隨機模式。'},
 {year:'2024', title:'Final Project', role:'Team Leader', type:'tech', body:'擔任期末專案團隊組長。'},
 {year:'2023', title:'環校路跑日記', role:'從 9 月開始的日常練習', type:'people', body:'從大學入學開始記錄跑步生活，逐漸加入日常分享、照片與英文內容。'}
];
const timelineEl = document.querySelector('#timeline');
function renderTimeline(filter='all') {
 timelineEl.replaceChildren(...timeline.filter(item=>filter==='all'||item.type===filter).map(item=>{
  const details=document.createElement('details'); details.className='timeline-item';
  const summary=document.createElement('summary');
  summary.innerHTML=`<span>${item.year}</span><div><h3>${item.title}</h3><span class="role">${item.role}</span></div><span class="plus" aria-hidden="true">+</span>`;
  const body=document.createElement('p'); body.textContent=item.body; details.append(summary,body); return details;
 }));
}
renderTimeline();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 renderTimeline(button.dataset.filter);
}));
const projects={
 sliding:{kicker:'01 / GAME DEVELOPMENT',title:'Sliding',body:'<div class="dialog-stats"><div><strong>6</strong><span>團隊成員</span></div><div><strong>20+</strong><span>特色關卡</span></div><div><strong>5+</strong><span>可選角色</span></div></div><p>在「程式設計（二）」期末專案中，我擔任六人遊戲開發團隊的組長。Sliding 結合《怪物彈珠》與《JUMP KING》的玩法特色，透過長按 Space 與左右方向鍵彈跳，在有限生命值內抵達終點。</p><p>團隊設計逾 20 個關卡，加入颶風、烈火等場地特性，以及傳送門、重力反轉帶等機制。超過 5 位角色各有不同技能，另有無限關卡與隨機模式。</p><p>期末報告時，授課老師程芙茵教授給予肯定，並詢問是否考慮在 Steam 上公開販售。</p><p><a href="https://canva.link/9x2qxtt70g76upu" target="_blank" rel="noopener noreferrer">閱讀原始期末簡報 ↗</a></p>'},
 camp:{kicker:'02 / LEADERSHIP & EXPERIENCE',title:'2025 中正資工營',body:'<p>我在 2025 中正資工營擔任總召集人、技術開發組組長與香舞教練。這段經歷讓我在同一個團隊裡，練習切換統籌、開發與教學的角色。</p><p>活動照片、開發成果與具體工作紀錄待補充。</p>'}
};
const projectDialog=document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
 const project=projects[button.dataset.project];
 document.querySelector('#dialog-kicker').textContent=project.kicker;
 document.querySelector('#dialog-title').textContent=project.title;
 document.querySelector('#dialog-body').innerHTML=project.body;
 projectDialog.showModal();
}));
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
});
const profileDialog=document.querySelector('#profile-dialog');
document.querySelectorAll('#open-profile,[data-open-profile]').forEach(button=>button.addEventListener('click',()=>profileDialog.showModal()));
document.querySelectorAll('[data-close-profile]').forEach(link=>link.addEventListener('click',()=>profileDialog.close()));
const lensNotes={build:'Sliding 遊戲開發專案：擔任六人團隊組長，完成逾 20 個關卡。',connect:'參與 AIESEC 國際交流，並擔任中正資工營總召與系學會副會長。',persist:'自 2023 年 9 月開始記錄環校路跑，逐漸加入照片與生活分享。'};
document.querySelectorAll('[data-lens]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('.personal-atlas').dataset.mode=button.dataset.lens;
 const note=document.querySelector('#atlas-note');note.textContent=lensNotes[button.dataset.lens];note.style.whiteSpace='pre-line';
}));
// Reading progress is the actual scrolled fraction of the available document.
const progress=document.querySelector('.reading-progress span');
let scrollQueued=false;
function updateProgress(){const available=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${available>0?Math.min(1,Math.max(0,scrollY/available)):0})`;scrollQueued=false;}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateProgress);}},{passive:true});
addEventListener('resize',updateProgress);updateProgress();
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('nav a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}),{rootMargin:'-20% 0px -60% 0px'});
document.querySelectorAll('#story,#about,#work,#journey').forEach(section=>sectionObserver.observe(section));
const motionButton=document.querySelector('#motion-toggle');
let motionOff=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateMotion(){document.body.classList.toggle('motion-off',motionOff);motionButton.textContent=`動態 ${motionOff?'OFF':'ON'}`;motionButton.setAttribute('aria-pressed',String(motionOff));}
updateMotion();motionButton.addEventListener('click',()=>{motionOff=!motionOff;updateMotion();});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:0.1});
document.querySelectorAll('.work-heading,.project,.journey-intro,.manifesto p,.connect h2').forEach(el=>{el.classList.add('reveal');observer.observe(el);});

// Optional public images take precedence over device-only uploads.
const imageDialog=document.querySelector('#image-dialog'),status=document.querySelector('#upload-status');
document.querySelector('#open-editor').addEventListener('click',()=>imageDialog.showModal());
const dbPromise=new Promise((resolve,reject)=>{const request=indexedDB.open('yc-images',1);request.onupgradeneeded=()=>request.result.createObjectStore('images');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
function storeImage(key,blob){return dbPromise.then(db=>new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put(blob,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);}));}
const activeUrls=new Map();
function showImage(key,url){const image=document.querySelector(`[data-image="${key}"]`);if(activeUrls.has(key))URL.revokeObjectURL(activeUrls.get(key));if(url.startsWith('blob:'))activeUrls.set(key,url);image.src=url;image.hidden=false;}
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
