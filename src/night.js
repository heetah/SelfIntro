import './night.css';

const stage=document.querySelector('#diary-book');
const sky=document.createElement('video');
sky.src='/media/night-sky.mp4';sky.poster='/media/night-sky-poster.webp';sky.muted=true;sky.loop=true;sky.playsInline=true;sky.preload='auto';
// One decoded film is shared by all visible book surfaces. Turning strips use
// the same saved frame, so a page never restarts its stars as it leaves the spine.
const surfaces=new Set();let visible=true,frameHandle=0;
function canvasFor(host){
 if(host.querySelector(':scope > .night-film'))return;
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=800;
 canvas.className='night-film';canvas.setAttribute('aria-hidden','true');host.append(canvas);surfaces.add(canvas);
}
function scan(){
 for(const canvas of surfaces)if(!canvas.isConnected)surfaces.delete(canvas);
 document.querySelectorAll('#book-left,#book-right,.cover-front,.cover-back').forEach(canvasFor);
 paint();
}
function paint(){
 if(sky.readyState<2)return;
 if(stage.classList.contains('book-turning'))return;
 for(const canvas of surfaces){
  if(!canvas.isConnected){surfaces.delete(canvas);continue;}
  canvas.getContext('2d',{alpha:false}).drawImage(sky,0,0,canvas.width,canvas.height);
 }
}
function frame(){paint();if(!sky.paused)frameHandle=sky.requestVideoFrameCallback?sky.requestVideoFrameCallback(frame):requestAnimationFrame(frame);}
function update(){
 const paused=!visible||document.hidden||document.body.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(paused){sky.pause();if(sky.cancelVideoFrameCallback)sky.cancelVideoFrameCallback(frameHandle);else cancelAnimationFrame(frameHandle);return;}
 if(sky.paused)sky.play().then(()=>frame()).catch(()=>{});
}
sky.addEventListener('loadeddata',()=>{paint();update();});
new MutationObserver(scan).observe(document.querySelector('.book-object'),{childList:true,subtree:true});
new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['class']});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();}).observe(stage);
document.addEventListener('visibilitychange',update);
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',update);
// Store one current frame for the paper mesh before each turn is assembled.
window.addEventListener('book-snapshot',()=>{
 const canvas=[...surfaces][0];
 if(canvas&&sky.readyState>=2)stage.style.setProperty('--night-frame',`url("${canvas.toDataURL('image/webp',.85)}")`);
});
scan();

// Deliberate page gestures: horizontal swipes turn; vertical gestures scroll.
let pointer=null;
stage.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'||!stage.classList.contains('book-open'))return;pointer={x:event.clientX,y:event.clientY,id:event.pointerId};},{passive:true});
stage.addEventListener('pointercancel',()=>{pointer=null;});
stage.addEventListener('pointerup',event=>{
 if(!pointer||pointer.id!==event.pointerId)return;
 const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;pointer=null;
 // A swipe traverses at least 15% of the book and is predominantly horizontal.
 if(Math.abs(dx)>stage.clientWidth*.15&&Math.abs(dx)>Math.abs(dy)*2){
  stage.dataset.swiped='true';document.querySelector(dx<0?'#book-next':'#book-prev').click();
  setTimeout(()=>delete stage.dataset.swiped,0);
 }
});
stage.addEventListener('click',event=>{if(stage.dataset.swiped){event.preventDefault();event.stopImmediatePropagation();}},true);

// Small depth cue on project covers, disabled for touch and reduced motion.
document.querySelectorAll('.project-visual').forEach(card=>{
 card.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'||document.body.classList.contains('motion-off'))return;
  const box=card.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
  card.style.transform=`perspective(1100px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
 });
 card.addEventListener('pointerleave',()=>card.style.transform='');
});
