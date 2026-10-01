import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
const closedWidth=await page.locator('#book-cover').evaluate(el=>el.offsetWidth);
await page.locator('#book-cover').click();
await page.waitForFunction(()=>document.querySelector('#book-cover').getAnimations().length>0);
await page.evaluate(async()=>{window.tracks=document.querySelector('.book-object').getAnimations({subtree:true});window.tracks.forEach(a=>a.pause());await Promise.all(window.tracks.map(a=>a.ready));});
for(const progress of [.25,.5,.85,.999]){
 await page.evaluate(p=>window.tracks.forEach(a=>a.currentTime=a.effect.getTiming().duration*p),progress);
 assert.equal(await page.locator('#book-cover').evaluate(el=>el.offsetWidth),closedWidth,'No cover reflow');
 assert.equal(await page.locator('.cover-back').textContent(),await page.locator('#book-left').textContent(),'Continuous inside cover');
 await page.screenshot({path:`analysis/motion-open-${progress}.png`});
}
await page.evaluate(()=>window.tracks.forEach(a=>a.finish()));
await page.waitForFunction(()=>document.querySelector('#diary-book').classList.contains('book-open'));
await page.screenshot({path:'analysis/motion-open-settled.png'});
await page.locator('#book-next').click();
await page.waitForFunction(()=>document.querySelector('.paper-strip')?.getAnimations().length>0);
await page.evaluate(async()=>{window.tracks=document.querySelector('.turn-sheet').getAnimations({subtree:true});window.tracks.forEach(a=>a.pause());await Promise.all(window.tracks.map(a=>a.ready));});
for(const progress of [.25,.5,.75,.999]){
 await page.evaluate(p=>window.tracks.forEach(a=>a.currentTime=a.effect.getTiming().duration*p),progress);
 await page.screenshot({path:`analysis/motion-turn-${progress}.png`});
}
await page.evaluate(()=>window.tracks.forEach(a=>a.finish()));
await page.waitForFunction(()=>document.querySelector('#diary-book').dataset.spread==='1');
await page.screenshot({path:'analysis/motion-turn-settled.png'});
// Measure live open/turn frame intervals; this is this browser/device, not an FPS guarantee.
await page.locator('#book-close').click();
await page.waitForFunction(()=>document.querySelector('#diary-book').getAttribute('aria-busy')==='false');
const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
const before=await cdp.send('Performance.getMetrics');
await page.evaluate(()=>{window.deltas=[];window.last=null;window.running=true;function tick(t){if(window.last!==null)window.deltas.push(t-window.last);window.last=t;if(window.running)requestAnimationFrame(tick)}requestAnimationFrame(tick);});
await page.locator('#book-cover').click();
await page.waitForFunction(()=>document.querySelector('#diary-book').classList.contains('book-open'));
const after=await cdp.send('Performance.getMetrics');
const frames=await page.evaluate(()=>{window.running=false;return window.deltas});
await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const metric=(m,n)=>m.metrics.find(x=>x.name===n)?.value;
const report={frames:frames.length,medianFrameMs:[...frames].sort((a,b)=>a-b)[Math.floor(frames.length/2)],maxFrameMs:Math.max(...frames),openLayoutCount:metric(after,'LayoutCount')-metric(before,'LayoutCount'),openLayoutMs:1000*(metric(after,'LayoutDuration')-metric(before,'LayoutDuration')),errors};
await page.evaluate(()=>{window.deltas=[];window.last=null;window.running=true;function tick(t){if(window.last!==null)window.deltas.push(t-window.last);window.last=t;if(window.running)requestAnimationFrame(tick)}requestAnimationFrame(tick);});
await page.locator('#book-next').click();
await page.waitForFunction(()=>document.querySelector('#diary-book').dataset.spread==='1'&&document.querySelector('#diary-book').getAttribute('aria-busy')==='false');
const turnFrames=await page.evaluate(()=>{window.running=false;return window.deltas});
report.turn={frames:turnFrames.length,medianFrameMs:[...turnFrames].sort((a,b)=>a-b)[Math.floor(turnFrames.length/2)],maxFrameMs:Math.max(...turnFrames)};
fs.writeFileSync('analysis/book-motion-performance.json',JSON.stringify(report,null,2));
assert.deepEqual(errors,[]);console.log(report);
await browser.close();
