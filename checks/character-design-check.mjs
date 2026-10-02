import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173');
 assert.equal(await page.locator('#motion-toggle').count(),0);
 assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('motion-off')),false);
 const cards=await page.locator('.project').evaluateAll(nodes=>nodes.map(el=>({id:el.dataset.chapter,y:el.getBoundingClientRect().y,bottom:el.getBoundingClientRect().bottom})));
 assert.deepEqual(cards.map(c=>c.id),['sliding','association','camp','camptech','vision','cloudmile']);
 cards.slice(1).forEach((c,i)=>assert.ok(c.y>cards[i].bottom,'Project chapters have visible space between them'));
 await page.locator('#personality').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('#personality [role=tab]').count(),4);
 await page.locator('#trait-tab-1').click();assert.match(await page.locator('#trait-panel').textContent(),/剩下的交給我們/);
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#trait-tab-2').getAttribute('aria-selected'),'true');
 await page.locator('#language-toggle').click();assert.match(await page.locator('#trait-panel').textContent(),/English conversations/);
 assert.equal(await page.locator('#trait-tab-2').getAttribute('aria-selected'),'true');
 await page.screenshot({path:'analysis/character-desktop.png'});
 await page.locator('#work').scrollIntoViewIfNeeded();await page.locator('.memory-project .is-current').evaluateAll(async images=>Promise.all(images.map(image=>image.decode())));await page.screenshot({path:'analysis/chapters-desktop.png'});
 for(const width of [320,375,768]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow ${width}`);}
 await page.setViewportSize({width:375,height:900});await page.locator('#personality').scrollIntoViewIfNeeded();await page.locator('#personality').screenshot({path:'analysis/character-mobile.png'});
 await page.setViewportSize({width:1440,height:1000});await page.locator('#story').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);await page.locator('#book-cover').click();
 await page.waitForFunction(()=>document.querySelector('#diary-book').getAttribute('aria-busy')==='false');
 const frame=()=>page.locator('#book-left>.night-film').evaluate(c=>c.toDataURL());const a=await frame();await page.waitForTimeout(800);assert.notEqual(await frame(),a,'Figma film is playing');
 await page.locator('#diary-book').screenshot({path:'analysis/constellation-book.png'});
 assert.deepEqual(errors,[]);console.log('PASS: motion default, six spaced chapters, bilingual accessible trait tabs, responsive layout, animated Figma film.');
}finally{await browser.close();}
