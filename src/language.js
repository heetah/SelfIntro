import { translations } from './translations.js';

const originals=new WeakMap();
let language='zh';
try{language=localStorage.getItem('heetah-language')==='en'?'en':'zh';}catch{}
const button=document.createElement('button');button.id='language-toggle';button.type='button';
document.querySelector('header nav').append(button);
const dynamic=[
 [/^第 (\d+) 頁原始日記$/,n=>`Original page ${n}`],
 [/^放大閱讀第 (\d+) 篇日記$/,n=>`Enlarge entry ${n}`],
 [/^第 (\d+) 篇原始日記圖文$/,n=>`Original diary scan ${n} (Chinese)`],
 [/^第 (\d+) 篇 \/ HEETAH$/,n=>`ENTRY ${n} / HEETAH`],
 [/^第 (\d+) 篇日記 · 待續$/,n=>`Entry ${n} · To be continued`],
 [/^第 (\d+)、(\d+) 篇日記$/,(a,b)=>`Entries ${a}–${b}`],
 [/^(\d+) 頁原始日記 \/ (\d+) 組雙頁$/,(a,b)=>`${a} original pages / ${b} spreads`],
 [/^第 (\d+) 組，共 (\d+) 組雙頁$/,(a,b)=>`Spread ${a} of ${b}`],
 [/^第 (\d+) 篇日記$/,n=>`Entry ${n}`],
];
function english(text){
 const trimmed=text.trim();
 if(translations[trimmed])return text.replace(trimmed,translations[trimmed]);
 for(const [pattern,format] of dynamic){const match=trimmed.match(pattern);if(match)return text.replace(trimmed,format(...match.slice(1)));}
 return text;
}
function convert(node,key,value){
 let record=originals.get(node);if(!record){record={};originals.set(node,record);}
 // Re-rendered status labels become new source strings. Our own writes do not.
 if(!record[key]||value!==record[key].output)record[key]={source:value,output:value};
 const entry=record[key],output=language==='en'?english(entry.source):entry.source;
 entry.output=output;return output;
}
function translate(root){
 if(root.nodeType===Node.TEXT_NODE){
  if(root.parentElement?.closest('script,style,#language-toggle'))return;
  const output=convert(root,'text',root.data);if(output!==root.data)root.data=output;return;
 }
 if(root.nodeType!==Node.ELEMENT_NODE||root.matches('script,style,#language-toggle'))return;
 for(const key of ['aria-label','aria-valuetext','alt','title','placeholder'])if(root.hasAttribute(key)){
  const value=root.getAttribute(key),output=convert(root,key,value);if(output!==value)root.setAttribute(key,output);
 }
 for(const child of root.childNodes)translate(child);
}
function apply(){
 document.documentElement.lang=language==='en'?'en':'zh-Hant';
 button.textContent=language==='en'?'繁中':'EN';button.setAttribute('aria-label',language==='en'?'切換至繁體中文':'Switch to English');
 button.setAttribute('lang',language==='en'?'zh-Hant':'en');
 translate(document.body);translate(document.querySelector('title'));
 window.dispatchEvent(new CustomEvent('languagechange',{detail:{language}}));
}
button.addEventListener('click',async()=>{
 button.disabled=true;
 // Let the current physical page land before changing its typesetting.
 while(document.querySelector('#diary-book').getAttribute('aria-busy')==='true')await new Promise(requestAnimationFrame);
 const anchor=[...document.querySelectorAll('main>section')].find(el=>el.getBoundingClientRect().bottom>100);
 const top=anchor?.getBoundingClientRect().top;
 language=language==='en'?'zh':'en';try{localStorage.setItem('heetah-language',language);}catch{}
 apply();
 if(anchor)window.scrollBy({top:anchor.getBoundingClientRect().top-top,behavior:'instant'});
 button.disabled=false;
});
apply();
new MutationObserver(records=>{
 for(const record of records){
  if(record.type==='characterData')translate(record.target);
  else if(record.type==='attributes')translate(record.target);
  else for(const node of record.addedNodes)translate(node);
 }
}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-valuetext','alt','title','placeholder']});
