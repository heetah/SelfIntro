import './memories.css';
import {memoryGroups} from './memory-data.js';

const lang=()=>document.documentElement.lang==='en'?'en':'zh';
const copy={zh:{previous:'上一張照片',next:'下一張照片',pause:'暫停輪播',play:'播放輪播',album:'記憶照片',select:'選擇記憶分類',title:'記憶中的現場',intro:'同一段經歷的照片，放在一起慢慢看。',error:'這張照片暫時無法載入。',show:n=>`顯示第 ${n} 張照片`},en:{previous:'Previous photograph',next:'Next photograph',pause:'Pause slideshow',play:'Play slideshow',album:'Memory photographs',select:'Choose a memory collection',title:'Scenes I remember',intro:'Photographs from each experience, collected together.',error:'This photograph could not be loaded.',show:n=>`Show photograph ${n}`}};
const instances=new Set();
// Six seconds is an editorial pacing choice, leaving time to read a caption.
const SLIDE_INTERVAL_MS=6000;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

export function createCarousel(groupKey,{compact=false}={}){
 const root=document.createElement('section');root.className=`memory-carousel${compact?' memory-compact':''}`;root.dataset.languageOwned='true';root.dataset.memoryGroup=groupKey;root.setAttribute('role','region');
 root.innerHTML='<div class="memory-frame" tabindex="0"><div class="memory-images"></div><p class="memory-error" hidden></p></div><div class="memory-controls"><span class="memory-caption"></span><div class="memory-transport"><button type="button" class="memory-prev">←</button><span class="memory-count"></span><button type="button" class="memory-next">→</button><button type="button" class="memory-play">Ⅱ</button></div></div><div class="memory-dots"></div><span class="memory-announcement" role="status" aria-live="polite"></span>';
 const frame=root.querySelector('.memory-frame'),images=root.querySelector('.memory-images'),dots=root.querySelector('.memory-dots'),status=root.querySelector('.memory-announcement');
 let group=memoryGroups[groupKey],index=0,playing=true,visible=false,hovered=false,focused=false,timer=null,destroyed=false,touch=null;
 const c=()=>copy[lang()];
 const motionOff=()=>reduced.matches||document.body.classList.contains('motion-off');
 function schedule(){clearTimeout(timer);timer=null;
  const modal=document.querySelector('dialog[open]');
  if(destroyed||!playing||!visible||hovered||focused||document.hidden||motionOff()||group.photos.length<2||(modal&&!modal.contains(root)))return;
  timer=setTimeout(()=>{show((index+1)%group.photos.length,false);},SLIDE_INTERVAL_MS);
 }
 function localize(){
  root.setAttribute('aria-label',`${group.title[lang()]} · ${c().album}`);root.setAttribute('aria-roledescription',lang()==='en'?'carousel':'輪播');
  frame.setAttribute('aria-label',`${group.title[lang()]} · ${c().album}`);
  root.querySelector('.memory-caption').textContent=group.photos[index].caption[lang()];
  root.querySelector('.memory-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(group.photos.length).padStart(2,'0')}`;
  root.querySelector('.memory-prev').setAttribute('aria-label',c().previous);root.querySelector('.memory-next').setAttribute('aria-label',c().next);
  const play=root.querySelector('.memory-play');play.textContent=playing?'Ⅱ':'▶';play.setAttribute('aria-label',playing?c().pause:c().play);play.setAttribute('aria-pressed',String(playing));play.disabled=motionOff();
  root.querySelector('.memory-error').textContent=c().error;
  [...images.children].forEach((image,n)=>image.alt=group.photos[n].caption[lang()]);
  [...dots.children].forEach((button,n)=>{button.setAttribute('aria-label',c().show(n+1));button.setAttribute('aria-current',String(n===index));});
  root.querySelector('.memory-transport').hidden=group.photos.length<2;dots.hidden=group.photos.length<2;
 }
 function show(next,announce=true){
  index=(next+group.photos.length)%group.photos.length;
  [...images.children].forEach((image,n)=>{image.classList.toggle('is-current',n===index);image.setAttribute('aria-hidden',String(n!==index));if(n===index&&!image.src){image.loading='eager';image.src=group.photos[n].src;}});
  const current=images.children[index];root.querySelector('.memory-error').hidden=current.dataset.failed!=='true';
  // Load the following photograph ahead of its fade, without fetching the whole album.
  if(group.photos.length>1){const nextIndex=(index+1)%group.photos.length;if(!images.children[nextIndex].src){images.children[nextIndex].loading='eager';images.children[nextIndex].src=group.photos[nextIndex].src;}}
  localize();if(announce)status.textContent=`${group.photos[index].caption[lang()]} · ${index+1} / ${group.photos.length}`;schedule();
 }
 function setGroup(key,preview=null){groupKey=key;group=preview?{...memoryGroups[key],photos:[preview,...memoryGroups[key].photos]}:memoryGroups[key];root.dataset.memoryGroup=key;index=0;status.textContent='';
  images.replaceChildren(...group.photos.map(photo=>{const image=document.createElement('img');image.decoding='async';image.loading='lazy';image.width=1600;image.height=1067;image.addEventListener('error',()=>{image.dataset.failed='true';if(image===images.children[index])root.querySelector('.memory-error').hidden=false;});image.addEventListener('load',()=>{delete image.dataset.failed;if(image===images.children[index])root.querySelector('.memory-error').hidden=true;});return image;}));
  dots.replaceChildren(...group.photos.map((photo,n)=>{const button=document.createElement('button');button.type='button';button.addEventListener('click',()=>show(n));return button;}));show(0,false);
 }
 root.querySelector('.memory-prev').addEventListener('click',()=>show(index-1));root.querySelector('.memory-next').addEventListener('click',()=>show(index+1));
 root.querySelector('.memory-play').addEventListener('click',()=>{playing=!playing;localize();schedule();});
 frame.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));}});
 // Require a deliberate horizontal swipe covering 15% of the photograph.
 frame.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touch={id:event.pointerId,x:event.clientX,y:event.clientY};},{passive:true});
 frame.addEventListener('pointercancel',()=>touch=null);
 frame.addEventListener('pointerup',event=>{if(!touch||touch.id!==event.pointerId)return;const dx=event.clientX-touch.x,dy=event.clientY-touch.y;touch=null;if(Math.abs(dx)>frame.clientWidth*.15&&Math.abs(dx)>Math.abs(dy)*2)show(index+(dx<0?1:-1));},{passive:true});
 root.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovered=true;schedule();}});root.addEventListener('pointerleave',()=>{hovered=false;schedule();});
 root.addEventListener('focusin',()=>{focused=true;schedule();});root.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=root.contains(document.activeElement);schedule();});});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();});observer.observe(root);
 const onLanguage=()=>localize();window.addEventListener('languagechange',onLanguage);
 const instance={root,setGroup,setPreviewImage:url=>setGroup(groupKey,{src:url,caption:{zh:'此裝置上傳的照片',en:'Photograph uploaded on this device'}}),update:()=>{localize();schedule();},destroy:()=>{destroyed=true;clearTimeout(timer);observer.disconnect();window.removeEventListener('languagechange',onLanguage);instances.delete(instance);}};
 instances.add(instance);setGroup(groupKey);return instance;
}
function updateAll(){instances.forEach(instance=>instance.update());}
document.addEventListener('visibilitychange',updateAll);reduced.addEventListener('change',updateAll);
new MutationObserver(updateAll).observe(document.body,{attributes:true,attributeFilter:['class']});
new MutationObserver(updateAll).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});

export function mountMemoryGallery(){
 const section=document.createElement('div');section.id='memories';section.className='memory-gallery';section.dataset.languageOwned='true';
 section.innerHTML='<div class="memory-gallery-heading"><div><span class="memory-eyebrow">PERSONAL ARCHIVE</span><h3></h3></div><p></p></div><div class="memory-tabs" role="tablist"></div><div class="memory-panel" id="memory-panel" role="tabpanel"></div>';
 const gallery=createCarousel('camp');section.querySelector('.memory-panel').append(gallery.root);
 const tabs=section.querySelector('.memory-tabs');let selected='camp';
 Object.entries(memoryGroups).forEach(([key,group])=>{const button=document.createElement('button');button.id=`memory-tab-${key}`;button.type='button';button.dataset.group=key;button.setAttribute('role','tab');button.setAttribute('aria-controls','memory-panel');button.addEventListener('click',()=>select(key));tabs.append(button);});
 function localize(){section.querySelector('h3').textContent=copy[lang()].title;section.querySelector('.memory-gallery-heading p').textContent=copy[lang()].intro;tabs.setAttribute('aria-label',copy[lang()].select);
  [...tabs.children].forEach(button=>{button.textContent=memoryGroups[button.dataset.group].title[lang()];button.setAttribute('aria-selected',String(button.dataset.group===selected));button.tabIndex=button.dataset.group===selected?0:-1;});section.querySelector('.memory-panel').setAttribute('aria-labelledby',`memory-tab-${selected}`);
 }
 function select(key){selected=key;gallery.setGroup(key);localize();}
 tabs.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=[...tabs.children];let n=buttons.indexOf(document.activeElement);n=event.key==='Home'?0:event.key==='End'?buttons.length-1:(n+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[n].click();buttons[n].focus();});
 document.querySelector('.journey-layout').after(section);window.addEventListener('languagechange',localize);localize();
 return {select,root:section};
}
