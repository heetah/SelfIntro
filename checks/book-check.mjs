import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function waitBook(index){await page.waitForFunction(index=>document.querySelector('#diary-book').dataset.spread===String(index)&&document.querySelector('#diary-book').getAttribute('aria-busy')==='false',index);}
async function waitAnimations(selector){await page.locator(selector).evaluate(async el=>{await Promise.all(el.getAnimations().map(a=>a.finished));});}
async function revealAndCapture(path){
 const height=await page.evaluate(()=>document.documentElement.scrollHeight);
 for(let y=0;y<height;y+=700){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(120);}
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(800);
 await page.screenshot({path,fullPage:true});
}
await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
assert.equal(await page.locator('main>section').first().getAttribute('id'),'story');
assert.match(await page.locator('header .logo').textContent(),/Heetah/);
assert.equal(await page.locator('#book-slider,.book-nav-foot').count(),0);
await page.screenshot({path:'analysis/book-closed-desktop.png'});
await page.locator('#book-cover').click();
await page.waitForFunction(()=>document.querySelector('#diary-book').classList.contains('book-opening'));
assert.equal(await page.locator('#book-cover').evaluate(el=>el.getAnimations().length>0),true,'Cover animation');
await waitBook(0);
assert.match(await page.locator('#book-left').textContent(),/序章/);
assert.equal(await page.locator('#book-right [data-entry]').getAttribute('data-entry'),'0');
assert.equal(await page.locator('#book-left .page-content').evaluate(el=>el.scrollHeight<=el.clientHeight),true,'Preface clipped');
await page.screenshot({path:'analysis/book-open-desktop.png'});
await page.locator('#edge-next').click();
await page.waitForSelector('.turn-sheet');
assert.equal(await page.locator('.turn-sheet').evaluate(el=>el.getAnimations({subtree:true}).length>0),true,'Page turn animation');
await page.screenshot({path:'analysis/book-turn-desktop.png'});
await waitBook(1);
assert.equal(await page.locator('#book-left [data-entry]').getAttribute('data-entry'),'1');
assert.equal(await page.locator('#book-right [data-entry]').getAttribute('data-entry'),'2');
await page.locator('#diary-book').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');
await page.waitForSelector('.turn-sheet');
await waitBook(3);
assert.equal(await page.locator('#book-left [data-entry]').getAttribute('data-entry'),'5');
assert.equal(await page.locator('#book-right [data-entry]').getAttribute('data-entry'),'6');
// Input during a turn must settle on the newest requested spread.
await page.locator('#diary-book').focus();await page.keyboard.press('ArrowLeft');
await waitBook(2);
await page.locator('#book-right [data-entry]').click();
assert.equal(await page.locator('#diary-image-dialog').evaluate(el=>el.open),true);
await waitAnimations('#diary-image-dialog');await page.screenshot({path:'analysis/diary-zoom.png'});
await page.keyboard.press('Escape');
await page.locator('#diary-book').focus();await page.keyboard.press('ArrowLeft');await waitBook(1);
// Reach the boundary using the retained keyboard controls.
const manifest=await (await page.request.get('http://127.0.0.1:5173/diary/pages.json')).json();const max=Math.ceil((manifest.entries.length+1)/2)-1;
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#diary-book').focus();
for(let target=Math.min(6,max);;target=Math.min(target+5,max)){await page.keyboard.press('Shift+ArrowRight');await waitBook(target);if(target===max)break;}
assert.equal(await page.locator('#edge-next').isDisabled(),true);
await page.locator('#book-close').click();await waitBook(0);assert.equal(await page.locator('#book-cover').isVisible(),true);
await page.locator('#book-cover').click();await waitBook(0);
assert.equal(await page.locator('#edge-prev').isDisabled(),true);
await page.locator('#open-profile').click();assert.equal(await page.locator('#profile-dialog').evaluate(el=>el.open),true);
await page.keyboard.press('Escape');assert.equal(await page.locator('#open-profile').evaluate(el=>el===document.activeElement),true);
await page.locator('[data-project="sliding"]').first().click();assert.match(await page.locator('#dialog-body').textContent(),/20/);await page.keyboard.press('Escape');
await page.locator('[data-filter="tech"]').click();assert.equal(await page.locator('.timeline-item').count(),5);
await page.locator('.timeline-item summary').first().click();assert.equal(await page.locator('.timeline-item').first().evaluate(el=>el.open),true);
await page.locator('[data-filter="all"]').click();assert.equal(await page.locator('.timeline-item').count(),14);
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('#motion-toggle').count(),0);
await page.locator('#edge-next').click();await waitBook(1);assert.equal(await page.locator('.turn-sheet').count(),0);
await page.locator('#open-editor').click();await page.locator('[data-upload="sliding"]').setInputFiles('public/media/night-sky-poster.webp');
await page.waitForFunction(()=>!document.querySelector('[data-image="sliding"]').hidden);
await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>!document.querySelector('[data-image="sliding"]').hidden);
await page.locator('#open-editor').click();await Promise.all([page.waitForEvent('load'),page.locator('#reset-images').click()]);await page.waitForLoadState('networkidle');
await revealAndCapture('analysis/desktop.png');
for(const width of [320,375,768]){
 await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow at ${width}`);
 await page.screenshot({path:`analysis/book-closed-${width}.png`});
 await page.locator('#book-cover').click();await waitBook(0);
 assert.equal(await page.locator('#book-left .page-content').evaluate(el=>el.scrollHeight<=el.clientHeight),true,`Preface clipped at ${width}`);
 await page.screenshot({path:`analysis/book-open-${width}.png`});
 await page.locator('#edge-next').click();await waitBook(1);
 await page.locator('#book-right [data-entry]').click();assert.equal(await page.locator('#diary-image-dialog').evaluate(el=>el.open),true);await page.keyboard.press('Escape');
 await revealAndCapture(`analysis/width-${width}.png`);
}
await page.emulateMedia({reducedMotion:'reduce'});await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
assert.equal(await page.locator('#motion-toggle').count(),0);
await page.locator('#book-cover').click();await waitBook(0);await page.locator('#edge-next').click();await waitBook(1);
assert.deepEqual(errors,[],'Browser errors');
console.log('PASS: closed/open book, page ordering, cover/turn animations, keyboard seeking, zoom, keyboard, end boundary, reduced motion, mobile layouts, existing portfolio features.');
await browser.close();
