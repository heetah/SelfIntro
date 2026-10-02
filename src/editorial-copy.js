// Both language versions are authored together so a language switch retains meaning.
const copy=[
 ['.book-heading>p','從環校路跑，到寫程式、帶營隊與認識世界。<br>中文記下生活，英文陪我練習表達。','From campus runs to code, camp and new encounters.<br>Life recorded in Chinese; expression practised in English.'],
 ['.hero-thesis','我是張宇誠，Heetah，中正大學資工系學生。<br>我喜歡把想法做成能玩的遊戲、能用的活動介面，也喜歡把日常寫下來。大學裡，我從不敢開口的英文交流，走到帶領團隊；同時也學著承認，很多事情需要夥伴一起完成。','I’m Yu-Cheng Chang, Heetah, a computer science student at CCU.<br>I enjoy turning ideas into playable games and useful activity interfaces, and keeping a record of everyday life. University took me from hesitant English conversations to leading teams—and taught me how much depends on the people beside me.'],
 ['.work-heading>p','從遊戲的碰撞問題，到營隊現場的臨時變動，<br>我在反覆調整中，學著讓想法成為可用的成果。','From game collisions to last-minute camp changes,<br>I learned to turn ideas into working results through revision.'],
 ['.journey-intro .body-copy','從寫程式到帶活動，我也在過程中慢慢找到自己的方向。<br>展開每段經歷，閱讀我的工作與反思，並看看同行的夥伴。','Building software and organising events helped me find my direction.<br>Open an experience to read about the work, the reflection and the people involved.'],
 ['.connect p','從問題、模型分工到反向追蹤，閱讀我們如何一步步建立環保科技執法系統。','Explore how we built the environmental enforcement system, from the problem and model responsibilities to backtracking.'],
 ['.profile-name','從記錄生活，走向實作、交流與團隊協作。','From recording life to building, connecting and working with teams.'],
 ];
const lenses={
 build:['寫程式時，我學著把卡住的地方說清楚，和夥伴一起改變做法。Sliding 的碰撞與隨機地圖，是這段練習的起點。','Building taught me to describe what was stuck and rethink the approach with teammates. Sliding’s collisions and random maps were a starting point.'],
 connect:['從 AIESEC 的英文面試，到營隊招生與迎新，我慢慢學會主動開口，也學會把對方的需求聽進去。','English interviews, camp recruitment and orientation helped me learn to start a conversation—and listen to what others needed.'],
 persist:['日記有跑步，也有需要休息的日子。持續不是每一天都完美，而是願意回頭整理，再往前走。','The journal has runs and days of rest. Persistence meant returning, reflecting and taking another step.']
};
let lens='build';
const language=()=>document.documentElement.lang==='en'?1:0;
function render(){
 for(const [selector,...text] of copy){const element=document.querySelector(selector);if(element){element.dataset.languageOwned='true';element.innerHTML=text[language()];}}
 const note=document.querySelector('#atlas-note');if(note){note.dataset.languageOwned='true';note.textContent=lenses[lens][language()];}
}
document.querySelectorAll('[data-lens]').forEach(button=>button.addEventListener('click',()=>{lens=button.dataset.lens;render();}));
window.addEventListener('languagechange',render);render();
