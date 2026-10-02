import './book.css';
import { MOTION, play, decodeImages, paperTracks, reducedMotion } from './book-motion.js';

const stage=document.querySelector('#diary-book');
const spread=document.querySelector('.book-spread');
const cover=document.querySelector('#book-cover');
const object=document.querySelector('.book-object');
const coverBack=document.querySelector('.cover-back');
const left=document.querySelector('#book-left'),right=document.querySelector('#book-right');
const turnLayer=document.querySelector('.book-turn-layer');
const close=document.querySelector('#book-close');
const status=document.querySelector('#book-status');
const error=document.querySelector('#book-error');
const zoom=document.querySelector('#diary-image-dialog');
let zoomIndex=0,zoomOriginIndex=0;
const zoomControls=document.createElement('div');zoomControls.className='zoom-navigation';
zoomControls.innerHTML='<button type="button" id="zoom-prev" aria-label="上一張原始日記">← 上一頁</button><span>原始日記</span><button type="button" id="zoom-next" aria-label="下一張原始日記">下一頁 →</button>';
document.querySelector('.diary-zoom-heading').append(zoomControls);
const zoomPrev=zoomControls.querySelector('#zoom-prev'),zoomNext=zoomControls.querySelector('#zoom-next');
function showZoom(index){
 zoomIndex=Math.min(state.entries.length-1,Math.max(0,index));
 const image=document.querySelector('#diary-zoom-image');
 image.src=state.entries[zoomIndex].image;image.alt=`第 ${zoomIndex+1} 篇原始日記圖文`;
 document.querySelector('#diary-image-title').textContent=`第 ${zoomIndex+1} 篇日記`;
 zoomPrev.disabled=zoomIndex===0;zoomNext.disabled=zoomIndex===state.entries.length-1;
 void preload(zoomIndex+1);void preload(zoomIndex-1);
 zoom.scrollTop=0;
}
zoomPrev.addEventListener('click',()=>showZoom(zoomIndex-1));zoomNext.addEventListener('click',()=>showZoom(zoomIndex+1));
zoom.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();showZoom(zoomIndex+(event.key==='ArrowRight'?1:-1));}});
zoom.addEventListener('close',()=>{if(state.open&&zoomIndex!==zoomOriginIndex&&!state.busy)void turnTo(Math.floor((zoomIndex+1)/2));});
const state={entries:[],index:0,target:0,open:false,busy:false,loaded:false};
const edges=document.createElement('div');edges.className='book-edges';
edges.innerHTML='<button id="edge-prev" class="book-edge edge-prev" type="button" aria-label="點擊左側，往前翻頁"><span aria-hidden="true">‹</span><small>上一頁</small></button><button id="edge-next" class="book-edge edge-next" type="button" aria-label="點擊右側，往後翻頁"><span aria-hidden="true">›</span><small>下一頁</small></button>';
edges.hidden=true;stage.append(edges);
const edgePrev=edges.querySelector('#edge-prev'),edgeNext=edges.querySelector('#edge-next');
spread.inert=true;turnLayer.inert=true;
const totalSpreads=()=>Math.ceil((state.entries.length+1)/2);
const imageCache=new Map();
function preload(index){
 const entry=state.entries[index];if(!entry)return Promise.resolve();
 if(!imageCache.has(entry.image))imageCache.set(entry.image,new Promise(resolve=>{
  const image=new Image();image.src=entry.image;image.decode().catch(()=>{}).then(resolve);
 }));
 return imageCache.get(entry.image);
}
function pageFor(pageNumber){
 const page=document.createElement('div');page.className='page-content';
 if(pageNumber===0){
  page.classList.add('book-preface');
  page.innerHTML='<span class="page-kicker">PROLOGUE / 序</span><h2>從跑步，<br>開始認識自己。</h2><span class="preface-mark" aria-hidden="true">✳</span><p>2023 年 9 月，我開始記錄環校路跑。後來，課業與朋友也走進了書頁。</p><p>中文記下生活，英文練習表達。熱鬧、疲憊與猶豫，都留在這裡。</p><p>這段日記在阿里山告一段落。每一頁，都是我學著成長的過程。</p><span class="preface-signature">Heetah</span><span class="page-folio">序章 / THE BEGINNING</span>';
 }else if(pageNumber<=state.entries.length){
  const entry=state.entries[pageNumber-1];
  const kicker=document.createElement('span');kicker.className='page-kicker';kicker.textContent=`FIELD NOTE / ${String(pageNumber).padStart(3,'0')}`;
  const button=document.createElement('button');button.className='diary-page-image';button.dataset.entry=String(pageNumber-1);button.setAttribute('aria-label',`放大閱讀第 ${pageNumber} 篇日記`);
  const image=document.createElement('img');image.src=entry.image;image.alt=`第 ${pageNumber} 篇原始日記圖文`;image.draggable=false;button.append(image);
  const folio=document.createElement('span');folio.className='page-folio';folio.textContent=`第 ${pageNumber} 篇 / HEETAH`;
  page.append(kicker,button,folio);
 }else{
  page.classList.add('book-preface','book-epilogue');
  page.innerHTML='<span class="page-kicker">TO BE CONTINUED / 待續</span><h2>下一頁，<br>還在發生。</h2><span class="preface-mark" aria-hidden="true">✳</span><p>謝謝你讀到這裡。從一個人的跑步，到和夥伴一起完成作品，這些頁面留下了我改變的過程。</p><p>記錄有了句點，學習仍在繼續。接下來的作品與經歷，會讓你看見日記之外的實作。</p><a class="text-link" href="#work">繼續看看我的作品 ↗</a><span class="preface-signature">Heetah</span><span class="page-folio">A WORK IN PROGRESS.</span>';
 }
 return page;
}
function render(index){left.replaceChildren(pageFor(index*2));right.replaceChildren(pageFor(index*2+1));}
function syncControls(){
 edgePrev.disabled=!state.open||state.target===0;
 edgeNext.disabled=!state.open||state.target===totalSpreads()-1;
 edges.hidden=!state.open;
 close.disabled=!state.open||state.busy;
 const number=Math.min(state.entries.length||1,Math.max(1,state.index*2));
 status.textContent=`第 ${number} 篇日記`;
 stage.dataset.spread=String(state.index);
 stage.setAttribute('aria-busy',String(state.busy));
}
function preloadNeighbors(index){for(let i=Math.max(0,index*2-2);i<=Math.min(state.entries.length-1,index*2+3);i++)void preload(i);}
async function openBook(){
 if(!state.loaded||state.busy||state.open)return;
 state.busy=true;syncControls();state.index=state.target=0;
 await decodeImages(spread);
 coverBack.replaceChildren(pageFor(0));
 stage.classList.add('book-opening');spread.setAttribute('aria-hidden','false');
 await play([
  {element:object,frames:[{transform:'translateX(-25%)'},{transform:'translateX(0%)'}]},
  {element:cover,frames:[{transform:'rotateY(0deg)'},{transform:'rotateY(-180deg)'}]},
  {element:castShadow,frames:[{opacity:'0'},{opacity:'.32'},{opacity:'0'}]},
  {element:coverLight,frames:[{opacity:'0'},{opacity:'.2'},{opacity:'0'}]},
 ],MOTION.openMs);
 stage.classList.remove('book-opening');stage.classList.add('book-open');
 cover.hidden=true;spread.inert=false;state.open=true;state.busy=false;syncControls();preloadNeighbors(0);
 stage.focus({preventScroll:true});
}
async function closeBook(){
 if(state.busy||!state.open)return;
 state.busy=true;syncControls();spread.inert=true;
 // The inside cover carries the currently visible left page all the way shut.
 coverBack.replaceChildren(left.firstElementChild.cloneNode(true));
 cover.hidden=false;cover.style.transform='rotateY(-180deg)';
 stage.classList.add('book-closing');stage.classList.remove('book-open');
 await play([
  {element:object,frames:[{transform:'translateX(0%)'},{transform:'translateX(-25%)'}]},
  {element:cover,frames:[{transform:'rotateY(-180deg)'},{transform:'rotateY(0deg)'}]},
  {element:castShadow,frames:[{opacity:'0'},{opacity:'.32'},{opacity:'0'}]},
  {element:coverLight,frames:[{opacity:'0'},{opacity:'.2'},{opacity:'0'}]},
 ],MOTION.closeMs);
 state.open=false;state.busy=false;state.index=state.target=0;
 stage.classList.remove('book-closing');spread.setAttribute('aria-hidden','true');
 render(0);coverBack.replaceChildren(pageFor(0));syncControls();cover.focus({preventScroll:true});
}
async function turnTo(target){
 if(!state.open)return;
 state.target=Math.min(totalSpreads()-1,Math.max(0,target));
 syncControls();
 if(state.busy)return;
 while(state.index!==state.target){
  state.busy=true;syncControls();
  const from=state.index,to=state.target,forward=to>from;
  const count=reducedMotion()?0:Math.min(Math.abs(to-from),MOTION.maxSheets);
  const stops=Array.from({length:count+1},(_,i)=>Math.round(from+(to-from)*i/Math.max(count,1)));
  await Promise.all([...new Set([...stops,to].flatMap(index=>[index*2-1,index*2]))].map(preload));
  const destinationLeft=pageFor(to*2),destinationRight=pageFor(to*2+1);
  await Promise.all([decodeImages(destinationLeft),decodeImages(destinationRight)]);
  window.dispatchEvent(new Event('book-snapshot'));
  const tracks=[],sheets=[];
  const duration=count>1?MOTION.burstMs:MOTION.turnMs;
  const totalDuration=duration+Math.max(0,count-1)*MOTION.staggerMs;
  for(let i=0;i<count;i++){
   const sheet=document.createElement('div');sheet.className='turn-sheet';sheets.push(sheet);
   const front=document.createElement('div'),back=document.createElement('div');
   front.append(pageFor(forward?stops[i]*2+1:stops[i+1]*2+1));
   back.append(pageFor(forward?stops[i+1]*2:stops[i]*2));
   const delay=i*MOTION.staggerMs;
   tracks.push(...paperTracks(sheet,front,back,right.offsetWidth,right.offsetHeight,forward,count>1).map(track=>({...track,delay,duration})));
   // Subpixel depth orders the fan above the source and then above landed sheets.
   tracks.push({element:sheet,delay,duration,frames:[{transform:`translateZ(${1+(count-i)/count}px)`},{transform:`translateZ(${1+(i+1)/count}px)`}]});
   turnLayer.append(sheet);
  }
  if(!reducedMotion())tracks.push(
   {element:castShadow,frames:[{opacity:'0'},{opacity:'.24'},{opacity:'0'}]},
   {element:leftShadow,frames:[{opacity:'0'},{opacity:'.18'},{opacity:'0'}]},
  );
  // Reveal only the destination page behind the sheet; keep the opposite page until landing.
  if(forward)right.replaceChildren(destinationRight);else left.replaceChildren(destinationLeft);
  if(spread.contains(document.activeElement))stage.focus({preventScroll:true});
  spread.inert=true;stage.classList.add('book-turning');stage.dataset.direction=forward?'forward':'backward';
  stage.classList.toggle('book-fast-turn',count>1);
  await play(tracks,totalDuration);
  state.index=to;left.replaceChildren(destinationLeft);right.replaceChildren(destinationRight);
  sheets.forEach(sheet=>sheet.remove());spread.inert=false;stage.classList.remove('book-turning','book-fast-turn');
  state.busy=false;syncControls();preloadNeighbors(to);
 }
}
cover.addEventListener('click',openBook);
edgeNext.addEventListener('click',()=>void turnTo(state.target+1));edgePrev.addEventListener('click',()=>void turnTo(state.target-1));
close.addEventListener('click',()=>void closeBook());
stage.addEventListener('keydown',event=>{
 if(!state.open||event.target.closest('a'))return;
 if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();void turnTo(state.target+(event.key==='ArrowRight'?1:-1)*(event.shiftKey?5:1));}
});
// Bind to stable pages, not to cloned, decorative animation faces.
spread.addEventListener('click',event=>{
 const button=event.target.closest('[data-entry]');if(!button||state.busy)return;
 zoomOriginIndex=Number(button.dataset.entry);showZoom(zoomOriginIndex);zoom.showModal();
});
async function load(){
 error.hidden=true;cover.disabled=true;
 try{
  const response=await fetch('/diary/pages.json');if(!response.ok)throw new Error('Diary manifest unavailable');
  const data=await response.json();
  if(!Array.isArray(data.entries)||!data.entries.length)throw new Error('Empty diary');
  state.entries=data.entries;render(0);coverBack.replaceChildren(pageFor(0));
  await Promise.all([decodeImages(spread),document.fonts.ready]);
  state.loaded=true;syncControls();
  cover.disabled=false;document.querySelector('#cover-prompt').textContent='點擊，翻開這段生活 ↗';
  void preload(0);
 }catch{
  error.hidden=false;document.querySelector('#cover-prompt').textContent='書頁暫時無法載入';
 }
}
document.querySelector('#book-retry').addEventListener('click',load);
const castShadow=document.createElement('div');castShadow.className='book-cast-shadow';castShadow.setAttribute('aria-hidden','true');object.append(castShadow);
const leftShadow=castShadow.cloneNode();leftShadow.classList.add('book-left-shadow');object.append(leftShadow);
const coverLight=document.createElement('span');coverLight.className='cover-light';coverLight.setAttribute('aria-hidden','true');document.querySelector('.cover-front').append(coverLight);
void load();
