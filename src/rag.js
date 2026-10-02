import './rag.css';

const copy={zh:{eyebrow:'HEETAH / PERSONAL KNOWLEDGE',title:'從一個問題，認識我。',intro:'我的作品、學習與團隊經歷，都可以是對話的起點。',open:'詢問我的背景',badge:'AI 資料助理',panel:'關於 Heetah',subtitle:'依公開資料回答，附上閱讀來源。',welcome:'你想先了解哪一部分？',description:'從作品、團隊經驗或日常紀錄開始。',placeholder:'輸入你想了解的問題…',label:'你的問題',send:'送出問題',stop:'停止',clear:'重新開始',close:'關閉問答',preview:'網站資料預覽',connected:'問答服務已設定',previewNote:'目前提供公開資料預覽，自由提問需連接問答服務。',previewLabel:'網站資料預覽 · 非模型生成',source:'閱讀來源',you:'你',assistant:'資料助理',loading:'正在查找相關資料…',unavailable:'問答服務尚未連接。你可以先點選建議問題，閱讀已整理的公開資料。',error:'這次未能取得回答，請稍後重試。',retry:'重新送出',cancelled:'已停止這次提問。',privacy:'對話僅保留於這個頁面；送出問題後，由問答服務處理。',limit:'問題請控制在 2000 字以內。',empty:'請輸入問題。'},en:{eyebrow:'HEETAH / PERSONAL KNOWLEDGE',title:'A question is a place to begin.',intro:'Explore the projects, learning and teams behind these pages.',open:'Ask about my background',badge:'AI knowledge assistant',panel:'About Heetah',subtitle:'Answers grounded in public records, with sources.',welcome:'What would you like to explore?',description:'Start with a project, a team experience or the journal.',placeholder:'What would you like to know?',label:'Your question',send:'Send question',stop:'Stop',clear:'Start again',close:'Close conversation',preview:'Public record preview',connected:'Q&A service configured',previewNote:'Public record previews are available. Open questions require a connected Q&A service.',previewLabel:'Public record preview · Not model-generated',source:'Read the source',you:'You',assistant:'Knowledge assistant',loading:'Finding relevant records…',unavailable:'The Q&A service is not connected yet. Choose a suggested question to explore the public records.',error:'The answer could not be retrieved. Please try again later.',retry:'Try again',cancelled:'This request was stopped.',privacy:'Conversation stays in this page?s memory. When connected, questions and chat history are sent to the Q&A service.',limit:'Please keep your question under 2000 characters.',empty:'Please enter a question.'}};
const records=[
 {question:{zh:'Sliding 專案中，你負責什麼？',en:'What was your role in Sliding?'},answer:{zh:'我在程式設計（二）期末專案中，擔任六人遊戲開發團隊組長。團隊完成彈跳遊戲 Sliding，設計逾 20 個關卡、超過 5 位角色，以及無限與隨機模式。',en:'I led a six-person team for the Programming II final project. We built Sliding, a jumping game with more than 20 levels, over five characters, and endless and random modes.'},sources:[{title:{zh:'Sliding · 專案介紹',en:'Sliding · Project overview'},url:'#work'}]},
 {question:{zh:'有哪些團隊與領導經驗？',en:'Which teams have you worked with?'},answer:{zh:'我在 2025 中正資工營分別擔任總召、技術組組長與香舞教練。八個月籌備和颱風後的調整，讓我學會與夥伴分擔責任。系學會副會長與 AIESEC 的參與，則讓我在迎新、英文面試與學校接洽中練習溝通。',en:'I served as chair, technical team lead and dance instructor at the 2025 CCU CS Camp. Eight months of preparation and adapting after a typhoon taught me to share responsibility. Student association and AIESEC work gave me practice in orientation support, English interviews and conversations with schools.'},sources:[{title:{zh:'校園與團隊經歷',en:'Campus and team experience'},url:'#journey'}]},
 {question:{zh:'為什麼開始寫大學日記？',en:'How did the university journal begin?'},answer:{zh:'2023 年 9 月，我開始記錄環校路跑，後來也慢慢把課業、朋友與團隊放進生活記錄裡。2024 年 3 月，我開始用英文寫部分生活，一邊練習表達，一邊學著更自然地與人交流。這段連載最後在與朋友的阿里山之行告一段落。',en:'In September 2023, I began recording campus runs, then gradually included coursework, friends and teams. In March 2024, I started writing part of my life in English, practising expression while learning to communicate more naturally. I closed the series with an Alishan trip with friends.'},sources:[{title:{zh:'大學生活日記',en:'University journal'},url:'#story'}]},
];
const endpoint=import.meta.env.VITE_RAG_ENDPOINT?.trim()||'';
const language=()=>document.documentElement.lang==='en'?'en':'zh';
const t=key=>copy[language()][key];
const teaser=document.createElement('div');teaser.className='rag-invitation';teaser.dataset.languageOwned='true';
teaser.innerHTML='<div class="rag-invitation-art" aria-hidden="true"><span class="rag-orbit"></span><span class="rag-star">✧</span></div><div class="rag-invitation-copy"><span class="rag-eyebrow" data-copy="eyebrow"></span><h3 data-copy="title"></h3><p data-copy="intro"></p></div><button type="button" class="rag-open"><span data-copy="open"></span><span aria-hidden="true">↗</span></button>';
document.querySelector('#about').append(teaser);
const dialog=document.createElement('dialog');dialog.id='rag-dialog';dialog.className='rag-panel';dialog.dataset.languageOwned='true';dialog.setAttribute('aria-labelledby','rag-title');
dialog.innerHTML=`<div class="rag-panel-header"><div><span class="rag-eyebrow" data-copy="badge"></span><h2 id="rag-title" data-copy="panel"></h2><p data-copy="subtitle"></p></div><button type="button" class="dialog-close rag-close">×</button></div><div class="rag-service"><span class="rag-service-dot" aria-hidden="true"></span><span id="rag-status"></span><button type="button" id="rag-clear" data-copy="clear"></button></div><div class="rag-scroll"><div class="rag-welcome"><span class="rag-welcome-star" aria-hidden="true">✧</span><h3 data-copy="welcome"></h3><p data-copy="description"></p></div><div class="rag-suggestions"></div><p class="rag-preview-note" data-copy="previewNote"></p><div class="rag-messages" role="log" aria-live="polite" aria-relevant="additions"></div></div><form class="rag-composer"><label for="rag-question" data-copy="label"></label><div class="rag-input-row"><textarea id="rag-question" rows="2" maxlength="2000"></textarea><button class="rag-send" type="submit">↑</button></div><div class="rag-composer-foot"><span class="rag-hint" role="status"></span><button type="button" id="rag-stop" hidden data-copy="stop"></button></div><p data-copy="privacy"></p></form>`;
document.body.append(dialog);
const log=dialog.querySelector('.rag-messages'),scroll=dialog.querySelector('.rag-scroll'),input=dialog.querySelector('textarea'),send=dialog.querySelector('.rag-send'),stop=dialog.querySelector('#rag-stop'),hint=dialog.querySelector('.rag-hint');
let messages=[],controller=null,busy=false,opener=null;
function safeUrl(value){try{const url=new URL(value,location.href);if(!['http:','https:'].includes(url.protocol)||(url.protocol!=='https:'&&url.origin!==location.origin))return null;return url.href;}catch{return null;}}
function render(){
 log.replaceChildren();
 for(const message of messages){
  const article=document.createElement('article');article.className=`rag-message rag-${message.role}`;
  const label=document.createElement('span');label.className='rag-message-label';label.textContent=message.preview?t('previewLabel'):t(message.role==='user'?'you':'assistant');
  const body=document.createElement('p');body.textContent=message.record?message.record.answer[language()]:message.key?t(message.key):message.text;
  article.append(label,body);
  if(message.sources?.length){
   const group=document.createElement('div');group.className='rag-sources';
   const caption=document.createElement('span');caption.textContent=t('source');group.append(caption);
   for(const source of message.sources){const url=safeUrl(source.url);if(!url)continue;const link=document.createElement('a');link.href=url;link.textContent=(typeof source.title==='object'?source.title[language()]:source.title)||t('source');
    if(new URL(url).origin===location.origin&&new URL(url).hash&&new URL(url).pathname===location.pathname){link.addEventListener('click',()=>dialog.close());}
    else{link.target='_blank';link.rel='noopener noreferrer';}
    group.append(link);
   }
   article.append(group);
  }
  if(message.retry){const retry=document.createElement('button');retry.type='button';retry.className='rag-retry';retry.textContent=t('retry');retry.disabled=busy;retry.addEventListener('click',()=>ask(message.question,false));article.append(retry);}
  log.append(article);
 }
 log.setAttribute('aria-busy',String(busy));
}
function localize(){
 for(const host of [teaser,dialog])host.querySelectorAll('[data-copy]').forEach(el=>el.textContent=t(el.dataset.copy));
 dialog.querySelector('.rag-close').setAttribute('aria-label',t('close'));
 input.placeholder=t('placeholder');send.setAttribute('aria-label',t('send'));
 dialog.querySelector('#rag-status').textContent=t(endpoint?'connected':'preview');
 dialog.querySelector('.rag-preview-note').hidden=Boolean(endpoint);
 const suggestions=dialog.querySelector('.rag-suggestions');suggestions.replaceChildren();
 records.forEach(record=>{const button=document.createElement('button');button.type='button';button.textContent=record.question[language()];button.disabled=busy;button.addEventListener('click',()=>endpoint?ask(record.question[language()]):preview(record));suggestions.append(button);});
 render();
}
function setBusy(value){busy=value;send.disabled=value;stop.hidden=!value;dialog.querySelector('#rag-clear').disabled=value;dialog.querySelectorAll('.rag-suggestions button,.rag-retry').forEach(button=>button.disabled=value);}
function bottom(){scroll.scrollTo({top:scroll.scrollHeight,behavior:'auto'});}
function preview(record){messages.push({role:'user',text:record.question[language()]},{role:'assistant',record,preview:true,sources:record.sources});render();bottom();}
async function ask(question,append=true){
 if(busy)return;question=question.trim();hint.textContent='';if(!question){hint.textContent=t('empty');return;}
 if(question.length>2000){hint.textContent=t('limit');return;}
 const history=messages.filter(m=>!m.pending&&!m.preview&&!m.key).map(m=>({role:m.role,content:m.text}));
 if(!append&&history.at(-1)?.role==='user')history.pop();
 if(append)messages.push({role:'user',text:question});input.value='';
 if(!endpoint){messages.push({role:'assistant',key:'unavailable'});render();bottom();return;}
 controller=new AbortController();setBusy(true);messages.push({role:'assistant',key:'loading',pending:true});render();bottom();
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({message:question,language:language(),history,context:{section:document.querySelector('header nav a[aria-current]')?.hash||'#about',diarySpread:Number(document.querySelector('#diary-book')?.dataset.spread||0)}})});
  if(!response.ok)throw new Error('Request failed');
  const data=await response.json();if(typeof data.answer!=='string'||!data.answer.trim())throw new Error('Missing answer');
  messages=messages.filter(m=>!m.pending);messages.push({role:'assistant',text:data.answer,sources:Array.isArray(data.sources)?data.sources.filter(s=>s&&typeof s.url==='string'&&typeof s.title==='string'):[]});
 }catch(error){messages=messages.filter(m=>!m.pending);messages.push({role:'assistant',key:error.name==='AbortError'?'cancelled':'error',retry:error.name!=='AbortError',question});}
 finally{controller=null;setBusy(false);render();bottom();}
}
teaser.querySelector('.rag-open').addEventListener('click',event=>{opener=event.currentTarget;dialog.showModal();if(messages.length)bottom();input.focus({preventScroll:true});});
dialog.querySelector('.rag-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{controller?.abort();opener?.focus({preventScroll:true});});
dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();void ask(input.value);});
input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void ask(input.value);}});
stop.addEventListener('click',()=>controller?.abort());
dialog.querySelector('#rag-clear').addEventListener('click',()=>{messages=[];hint.textContent='';input.value='';render();input.focus();});
window.addEventListener('languagechange',localize);
localize();
