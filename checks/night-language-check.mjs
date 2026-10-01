import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const settled=async()=>page.waitForFunction(()=>document.querySelector('#diary-book').getAttribute('aria-busy')==='false');
await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
await page.screenshot({path:'analysis/night-closed.png'});
await page.locator('#book-cover').click();await settled();
await page.locator('#book-next').click();await settled();
const spread=await page.locator('#diary-book').getAttribute('data-spread');
await page.locator('#language-toggle').click();
assert.equal(await page.locator('html').getAttribute('lang'),'en');
assert.equal(await page.locator('#diary-book').getAttribute('data-spread'),spread);
assert.match(await page.locator('#book-status').textContent(),/Entries 2/);
await page.locator('[data-project="sliding"]').first().click();
assert.match(await page.locator('#dialog-body').textContent(),/six-person/);
await page.keyboard.press('Escape');
await page.locator('[data-filter="tech"]').click();
assert.equal(await page.locator('.timeline-item').count(),4);
assert.match(await page.locator('.timeline').textContent(),/software engineering/i);
await page.locator('#book-prev').click();await settled();
await page.locator('#book-right [data-entry]').click();
await page.locator('#zoom-next').click();
assert.match(await page.locator('#diary-image-title').textContent(),/Entry 2/);
await page.keyboard.press('ArrowRight');
assert.match(await page.locator('#diary-image-title').textContent(),/Entry 3/);
await page.keyboard.press('Escape');
await page.waitForFunction(()=>document.querySelector('#diary-book').dataset.spread==='1'&&document.querySelector('#diary-book').getAttribute('aria-busy')==='false');
assert.equal(await page.locator('#diary-book').getAttribute('data-spread'),'1','Zoom returns to selected spread');
await page.locator('#book-prev').click();await settled();
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.screenshot({path:'analysis/night-open-en.png'});
// Inventory untranslated UI, including attributes and closed dialogs.
const leftovers=await page.evaluate(()=>{
 const result=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement.closest('script,style,#language-toggle'))continue;if(/[\u4e00-\u9fff]/.test(n.data))result.push(n.data.trim());}
 for(const e of document.querySelectorAll('[aria-label],[alt]')){if(e.id==='language-toggle')continue;for(const a of ['aria-label','alt'])if(/[\u4e00-\u9fff]/.test(e.getAttribute(a)||''))result.push(e.getAttribute(a));}
 return [...new Set(result)];
});
fs.writeFileSync('analysis/translation-leftovers.json',JSON.stringify(leftovers,null,2));assert.deepEqual(leftovers,[],'Untranslated UI');
for(const width of [320,375,768]){
 await page.setViewportSize({width,height:900});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`English overflow ${width}`);
 assert.equal(await page.locator('#book-left .page-content').evaluate(el=>el.scrollHeight<=el.clientHeight),true,`English preface clips at ${width}`);
 await page.screenshot({path:`analysis/night-en-${width}.png`});
}
await page.locator('#language-toggle').click();
assert.match(await page.locator('#book-left').textContent(),/2023 年 9 月/);
for(const width of [320,375,768]){
 await page.setViewportSize({width,height:900});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Chinese overflow ${width}`);
 assert.equal(await page.locator('#book-left .page-content').evaluate(el=>el.scrollHeight<=el.clientHeight),true,`Chinese preface clips at ${width}`);
}
await page.locator('#language-toggle').click();await page.reload({waitUntil:'networkidle'});
assert.equal(await page.locator('html').getAttribute('lang'),'en','Language persists');
await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
await page.locator('#book-cover').click();await settled();
assert.match(await page.locator('#book-left').textContent(),/I began this journal/);
// Actual pixels must change while the externally rendered film is playing.
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.waitForTimeout(300);
const pixelFrame=()=>page.locator('#book-left>.night-film').evaluate(canvas=>canvas.toDataURL());
const firstFrame=await pixelFrame();await page.waitForTimeout(700);
assert.notEqual(await pixelFrame(),firstFrame,'Sky film animates');
await page.locator('#motion-toggle').click();await page.waitForTimeout(150);
const frozen=await pixelFrame();await page.waitForTimeout(300);
assert.equal(await pixelFrame(),frozen,'Sky pauses with motion off');
await page.locator('#diary-book').dispatchEvent('pointerdown',{pointerId:9,pointerType:'touch',clientX:600,clientY:300});
await page.locator('#diary-book').dispatchEvent('pointerup',{pointerId:9,pointerType:'touch',clientX:300,clientY:310});await settled();
assert.equal(await page.locator('#diary-book').getAttribute('data-spread'),'1','Touch swipe');
assert.deepEqual(errors,[]);
console.log('PASS: English/Chinese, dynamic dialogs, filters, persistence, page preservation, responsive prefaces, zero UI leftovers.');
await browser.close();
