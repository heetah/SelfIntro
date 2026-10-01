import {chromium} from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
await page.locator('#book-cover').click();
await page.waitForFunction(()=>document.querySelector('#diary-book').classList.contains('book-open'));
await page.evaluate(()=>{
 window.times=[];window.run=true;let last=null;
 function tick(t){if(last!==null)window.times.push(t-last);last=t;if(window.run)requestAnimationFrame(tick)}
 requestAnimationFrame(tick);
});
await page.locator('#book-fast-next').click();
await page.waitForFunction(()=>document.querySelector('#diary-book').dataset.spread==='5'&&document.querySelector('#diary-book').getAttribute('aria-busy')==='false');
const times=await page.evaluate(()=>{window.run=false;return window.times});
const report={samples:times.length,medianMs:[...times].sort((a,b)=>a-b)[Math.floor(times.length/2)],maxMs:Math.max(...times),over34ms:times.filter(x=>x>34).length,note:'Local Chromium, 1440x1000, cold five-spread action including preparation; not a cross-device FPS guarantee.'};
fs.writeFileSync('analysis/quick-turn-performance.json',JSON.stringify(report,null,2));console.log(report);
await browser.close();
