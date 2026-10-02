import {experiences,locale,localized} from './experience-data.js';
import {createCarousel,mountMemoryGallery} from './memories.js';
import {createCampStory} from './camp-story.js';
import './experience.css';

const gallery=mountMemoryGallery();
const timeline=document.querySelector('#timeline');timeline.dataset.languageOwned='true';
let filter='all',inlineAlbums=[];
function paragraphs(parent,item){
 for(const text of item.paragraphs){const p=document.createElement('p');p.textContent=localized(text);parent.append(p);}
 if(item.resource){const a=document.createElement('a');a.className='text-link';a.href=item.resource.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=localized(item.resource.label);parent.append(a);}
}
function renderTimeline(){
 const open=new Set([...timeline.querySelectorAll('details[open]')].map(el=>el.dataset.experience));
 inlineAlbums.forEach(album=>album.destroy());inlineAlbums=[];
 timeline.replaceChildren();
 for(const item of experiences.filter(item=>filter==='all'||item.type===filter)){
  const details=document.createElement('details');details.className='timeline-item';details.dataset.experience=item.id;
  const summary=document.createElement('summary');
  const year=document.createElement('span');year.textContent=locale()?(item.year==='2023 起'?'Since 2023':item.year==='暑期 / Summer'?'Summer':item.year):item.year;
  const heading=document.createElement('div'),title=document.createElement('h3'),role=document.createElement('span');
  title.textContent=localized(item.title);role.className='role';role.textContent=localized(item.role);heading.append(title,role);
  const plus=document.createElement('span');plus.className='plus';plus.textContent='+';plus.setAttribute('aria-hidden','true');summary.append(year,heading,plus);
  const body=document.createElement('div');body.className='experience-body';const prose=document.createElement('div');prose.className='experience-prose';paragraphs(prose,item);body.append(prose);details.append(summary,body);
  let album;
  function mountAlbum(){if(item.album&&!album){album=createCarousel(item.album);inlineAlbums.push(album);body.append(album.root);}}
  details.addEventListener('toggle',()=>{if(details.open)mountAlbum();});
  if(item.project){const button=document.createElement('button');button.type='button';button.className='camp-timeline-link';button.dataset.project=item.project;button.textContent=locale()?'Read this story ↗':'閱讀這段經歷 ↗';body.append(button);}
  if(open.has(item.id)){details.open=true;mountAlbum();}timeline.append(details);
 }
}
renderTimeline();
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter=button.dataset.filter;renderTimeline();
}));

const grid=document.querySelector('.project-grid');
const originalCamp=document.querySelector('.project-visual[data-project="camp"]');
const campVisual=document.createElement('div');campVisual.className='project-visual memory-project';
export const campCarousel=createCarousel('camp',{compact:true});campVisual.append(campCarousel.root);originalCamp.replaceWith(campVisual);
const projectCards={camp:campVisual.closest('.project')};
for(const key of ['camptech','vision','cloudmile','association']){
 const card=document.createElement('article');card.className='project';card.dataset.languageOwned='true';
 const item=experiences.find(item=>item.id===key);
 const visual=document.createElement(item.album?'div':'button');visual.className='project-visual memory-project';
 if(item.album)visual.append(createCarousel(item.album,{compact:true}).root);
 else{visual.type='button';visual.dataset.project=key;visual.className='project-visual research-visual';visual.innerHTML='<span class="research-caption">COMPUTER VISION</span><strong>Observe.<br>Track.<br>Understand.</strong><span class="research-orbit" aria-hidden="true"></span><span class="research-foot">RT-DETR · ST-GCN++ · Backtrack</span>';}
 const info=document.createElement('div');info.className='project-info';const text=document.createElement('div');text.append(document.createElement('h3'),document.createElement('p'));
 const button=document.createElement('button');button.type='button';button.dataset.project=key;button.textContent='↗';info.append(text,button);
 const tags=document.createElement('div');tags.className='tags';card.append(visual,info,tags);grid.append(card);projectCards[key]=card;
}
function renderCards(){
 for(const [key,card] of Object.entries(projectCards)){
  card.dataset.languageOwned='true';const item=experiences.find(item=>item.id===key);
  const label={camp:['資工營總召','CS Camp · Chair'],camptech:['資工營技術組','CS Camp · Technical team'],vision:['畢業專題','Graduation project'],cloudmile:['實習經歷','Internship'],association:['系學會副會長','Student Association · Vice president']}[key];
  card.querySelector('h3').textContent=localized(label);card.querySelector('.project-info p').textContent=localized(item.role);
  card.querySelectorAll('[data-project]').forEach(button=>button.setAttribute('aria-label',`${locale()?'Read':'閱讀'} ${localized(item.title)}`));
  const tags={camp:[['八個月籌備','Eight months of preparation'],['團隊協作','Team coordination']],camptech:[['營隊網站','Camp website'],['活動介面','Activity interfaces']],vision:[['電腦視覺','Computer vision'],['行為辨識','Action recognition']],cloudmile:[['生成式 AI','Generative AI'],['2026–2027','2026–2027']],association:[['迎新與活動','Orientation and events'],['溝通協調','Communication and coordination']]}[key];
  card.querySelector('.tags').replaceChildren(...tags.map(label=>{const span=document.createElement('span');span.textContent=localized(label);return span;}));
 }
}
renderCards();
const chapters=[
 ['sliding',['遊戲開發','Game development'],['把《怪物彈珠》與《JUMP KING》的特色，做成我們自己的彈跳遊戲。','Bringing elements of Monster Strike and JUMP KING into our own jumping game.']],
 ['camp',['活動統籌','Event leadership'],['八個月的籌備、一次颱風，以及一群願意一起把營隊辦好的夥伴。','Eight months of preparation, a typhoon, and teammates determined to make the camp happen.']],
 ['camptech',['技術實作','Technical development'],['從營隊官網到賭場、RPG 與定向，把每個活動的需求做成能用的介面。','From the camp website to casino, RPG and orienteering interfaces built around real activities.']],
 ['vision',['研究與探索','Research and exploration'],['與嘉義縣環保局合作，從模型訓練到反向追蹤，建立可供人工複核的環保科技執法系統。','Working with Chiayi County EPB, from model training to backtracking, to build an environmental enforcement system with human review.']],
 ['cloudmile',['實習經歷','Internship'],['從客戶需求與驗收標準，到權限、防護與可追溯的開發習慣，學著讓 AI 成果走進實際工作。','From client requirements and acceptance criteria to access controls, guardrails and traceable development, learning to deliver AI in practice.']],
 ['association',['校園參與','Campus involvement'],['從迎新到交接，學著把資訊講清楚，也把每個需要補上的位置接住。','From orientation to handover, learning to communicate clearly and step in where needed.']]
];
// Sort by the recorded start year; equal-year roles keep their original order.
chapters.sort((a,b)=>Number(experiences.find(item=>item.id===a[0]).year.slice(0,4))-Number(experiences.find(item=>item.id===b[0]).year.slice(0,4)));
const cardsById={sliding:grid.firstElementChild,...projectCards};
chapters.forEach(([id],i)=>{
 const card=cardsById[id];grid.append(card);card.dataset.chapter=id;
 const header=document.createElement('div');header.className='project-chapter';header.dataset.languageOwned='true';
 header.innerHTML=`<span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span class="chapter-category"></span><span class="chapter-year">${experiences.find(item=>item.id===id).year}</span>`;
 const content=document.createElement('div');content.className='project-summary';
 const teaser=document.createElement('p');teaser.className='project-teaser';teaser.dataset.languageOwned='true';
 content.append(card.querySelector('.project-info'),teaser,card.querySelector('.tags'));card.prepend(header);card.append(content);
});
function renderChapters(){chapters.forEach(([id,category,teaser],i)=>{const card=grid.children[i];card.querySelector('.chapter-category').textContent=localized(category);card.querySelector('.project-teaser').textContent=localized(teaser);});}
renderChapters();window.addEventListener('languagechange',renderChapters);
const dialog=document.querySelector('#project-dialog');dialog.dataset.languageOwned='true';
const header=document.createElement('div');header.className='project-dialog-header';header.append(dialog.querySelector('.dialog-close'),document.querySelector('#dialog-kicker'),document.querySelector('#dialog-title'));dialog.prepend(header);
let selected=null,dialogAlbum=null,story=null;
function renderDialogCopy(){
 if(!selected)return;
 document.querySelector('#dialog-kicker').textContent=localized(selected.role);
 document.querySelector('#dialog-title').textContent=localized(selected.title);
 dialog.querySelector('.dialog-close').setAttribute('aria-label',locale()?'Close story':'關閉經歷介紹');
 const prose=dialog.querySelector('.project-narrative');prose.replaceChildren();paragraphs(prose,selected);
 if(selected.id==='sliding'){
  const a=document.createElement('a');a.className='text-link';a.href='https://canva.link/9x2qxtt70g76upu';a.target='_blank';a.rel='noopener noreferrer';a.textContent=locale()?'Read the original presentation ↗':'閱讀原始期末簡報 ↗';prose.append(a);
 }
}
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-project]');if(!button)return;
 selected=experiences.find(item=>item.project===button.dataset.project);if(!selected)return;
 dialogAlbum?.destroy();story?.destroy();story=null;
 const body=document.querySelector('#dialog-body');body.replaceChildren();
 const prose=document.createElement('div');prose.className='project-narrative';body.append(prose);
 dialogAlbum=selected.album?createCarousel(selected.album):null;if(dialogAlbum)body.append(dialogAlbum.root);
 if(selected.id==='camp'){story=createCampStory(()=>{gallery.select('camp');dialog.close();});body.append(story.root);}
 dialog.classList.toggle('camp-dialog',selected.id==='camp');renderDialogCopy();dialog.showModal();dialog.scrollTop=0;
});
window.addEventListener('languagechange',()=>{
 // Update prose in place: open sections, selected photographs and focus survive.
 for(const details of timeline.children){
  const item=experiences.find(item=>item.id===details.dataset.experience);
  details.querySelector('h3').textContent=localized(item.title);details.querySelector('.role').textContent=localized(item.role);
  details.querySelector('summary>span').textContent=locale()?(item.year==='2023 起'?'Since 2023':item.year==='暑期 / Summer'?'Summer':item.year):item.year;
  const prose=details.querySelector('.experience-prose');prose.replaceChildren();paragraphs(prose,item);
  const button=details.querySelector('[data-project]');if(button)button.textContent=locale()?'Read this story ↗':'閱讀這段經歷 ↗';
 }
 renderCards();renderDialogCopy();
});
