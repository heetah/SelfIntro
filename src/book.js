import './book.css';
import { MOTION, play, decodeImages, paperTracks, reducedMotion } from './book-motion.js';

const stage=document.querySelector('#diary-book');
const spread=document.querySelector('.book-spread');
const cover=document.querySelector('#book-cover');
const object=document.querySelector('.book-object');
const coverBack=document.querySelector('.cover-back');
const left=document.querySelector('#book-left'),right=document.querySelector('#book-right');
const turnLayer=document.querySelector('.book-turn-layer');
const prev=document.querySelector('#book-prev'),next=document.querySelector('#book-next');
const slider=document.querySelector('#book-slider'),close=document.querySelector('#book-close');
const status=document.querySelector('#book-status'),pageCount=document.querySelector('#book-page-count');
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
stage.append(edges);
const edgePrev=edges.querySelector('#edge-prev'),edgeNext=edges.querySelector('#edge-next');
const fastPrev=document.createElement('button'),fastNext=document.createElement('button');
for(const [button,id,label,symbol] of [[fastPrev,'book-fast-prev','往前快翻 5 次','«'],[fastNext,'book-fast-next','往後快翻 5 次','»']]){
 button.id=id;button.type='button';button.className='book-fast-button';
 button.setAttribute('aria-label',label);button.title=label;button.textContent=symbol;
}
prev.before(fastPrev);next.after(fastNext);
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
  page.innerHTML='<span class="page-kicker">PROLOGUE / 序</span><h2>這不是一本<br>完成的書。</h2><span class="preface-mark" aria-hidden="true">✳</span><p>2023 年 9 月，我從環校路跑開始寫日記。</p><p>從跑步、課業，到創作與朋友，這些頁面記錄了我的大學生活，也留下了一路成長的樣子。</p><p>這本書，還在繼續。</p><span class="preface-signature">Heetah</span><span class="page-folio">序章 / THE BEGINNING</span>';
 }else if(pageNumber<=state.entries.length){
  const entry=state.entries[pageNumber-1];
  const kicker=document.createElement('span');kicker.className='page-kicker';kicker.textContent=`FIELD NOTE / ${String(pageNumber).padStart(3,'0')}`;
  const button=document.createElement('button');button.className='diary-page-image';button.dataset.entry=String(pageNumber-1);button.setAttribute('aria-label',`放大閱讀第 ${pageNumber} 篇日記`);
  const image=document.createElement('img');image.src=entry.image;image.alt=`第 ${pageNumber} 篇原始日記圖文`;image.draggable=false;button.append(image);
  const folio=document.createElement('span');folio.className='page-folio';folio.textContent=`第 ${pageNumber} 篇 / HEETAH`;
  page.append(kicker,button,folio);
 }else{
  page.classList.add('book-preface','book-epilogue');
  page.innerHTML='<span class="page-kicker">TO BE CONTINUED / 待續</span><h2>下一頁，<br>還在發生。</h2><span class="preface-mark" aria-hidden="true">✳</span><p>謝謝你翻閱這段大學生活。</p><p>在日記之外，還有我與團隊一起完成的作品、承擔的角色，以及持續探索的方向。</p><a class="text-link" href="#work">繼續看看我的作品 ↗</a><span class="preface-signature">Heetah</span><span class="page-folio">A WORK IN PROGRESS.</span>';
 }
 return page;
}
function render(index){left.replaceChildren(pageFor(index*2));right.replaceChildren(pageFor(index*2+1));}
function syncControls(){
 prev.disabled=!state.open||state.target===0;
 next.disabled=!state.open||state.target===totalSpreads()-1;
 edgePrev.disabled=fastPrev.disabled=prev.disabled;edgeNext.disabled=fastNext.disabled=next.disabled;
 edges.hidden=!state.open;
 close.disabled=!state.open||state.busy;
 slider.disabled=!state.open;slider.max=String(Math.max(0,totalSpreads()-1));slider.value=String(state.target);
 const first=state.index*2,last=Math.min(first+1,state.entries.length);
 status.textContent=!state.open?'翻開封面，從故事的起點開始。':first===0?'序章 · 第 1 篇日記':first===last?`第 ${first} 篇日記 · 待續`:`第 ${first}、${last} 篇日記`;
 pageCount.textContent=state.loaded?`${state.entries.length} 頁原始日記 / ${totalSpreads()} 組雙頁`:'正在載入日記';
 slider.setAttribute('aria-valuetext',`第 ${state.target+1} 組，共 ${totalSpreads()} 組雙頁`);
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
 state.target=Math.min(totalSpreads()-1,Math.max(0,target));slider.value=String(state.target);
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
next.addEventListener('click',()=>void turnTo(state.target+1));prev.addEventListener('click',()=>void turnTo(state.target-1));
edgeNext.addEventListener('click',()=>void turnTo(state.target+1));edgePrev.addEventListener('click',()=>void turnTo(state.target-1));
fastNext.addEventListener('click',()=>void turnTo(state.target+5));fastPrev.addEventListener('click',()=>void turnTo(state.target-5));
slider.addEventListener('input',()=>void turnTo(Number(slider.value)));
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
  pageCount.textContent='請重新載入書頁';
 }
}
document.querySelector('#book-retry').addEventListener('click',load);
const castShadow=document.createElement('div');castShadow.className='book-cast-shadow';castShadow.setAttribute('aria-hidden','true');object.append(castShadow);
const leftShadow=castShadow.cloneNode();leftShadow.classList.add('book-left-shadow');object.append(leftShadow);
const coverLight=document.createElement('span');coverLight.className='cover-light';coverLight.setAttribute('aria-hidden','true');document.querySelector('.cover-front').append(coverLight);
void load();
