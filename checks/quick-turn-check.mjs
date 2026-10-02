import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const settle=index=>page.waitForFunction(i=>document.querySelector('#diary-book').dataset.spread===String(i)&&document.querySelector('#diary-book').getAttribute('aria-busy')==='false',index);
 await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>!document.querySelector('#book-cover').disabled);
 assert.equal(await page.locator('.hero-bottom,#book-slider,.book-nav-foot,.book-direction').count(),0);
 assert.equal(await page.locator('.book-nav-top').evaluate(el=>[...el.children].map(c=>c.tagName).join(',')),'A,P,BUTTON');
 assert.equal(await page.locator('header nav #open-profile').count(),1);
 await page.locator('#open-profile').click();assert.equal(await page.locator('#profile-dialog').evaluate(el=>el.open),true);await page.keyboard.press('Escape');
 assert.equal(await page.locator('#open-profile').evaluate(el=>el===document.activeElement),true);
 assert.deepEqual(await page.locator('.project-grid>.project').evaluateAll(cards=>cards.map(c=>c.dataset.chapter)),['sliding','association','camp','camptech','vision','cloudmile']);
 const intro=await page.locator('.journey-intro').boundingBox(),timeline=await page.locator('.timeline').boundingBox();assert.ok(Math.abs(intro.width-timeline.width)<1);
 const first=await page.locator('.timeline-item').nth(0).boundingBox(),second=await page.locator('.timeline-item').nth(1).boundingBox();assert.ok(Math.abs(first.y-second.y)<1&&first.x+first.width<second.x);
 await page.locator('#book-cover').click();await settle(0);
 assert.equal(await page.locator('#edge-prev').isDisabled(),true);
 assert.equal(await page.locator('#book-status').textContent(),'第 1 篇日記');
 await page.locator('#edge-next').click();await settle(1);assert.equal(await page.locator('#book-status').textContent(),'第 2 篇日記');
 await page.locator('#edge-prev').click();await settle(0);
 await page.locator('#diary-book').focus();await page.keyboard.press('Shift+ArrowRight');
 await page.waitForFunction(()=>document.querySelectorAll('.turn-sheet').length===5);
 assert.equal(await page.locator('.turn-sheet').first().evaluate(el=>el.getAnimations({subtree:true}).length>0),true);await settle(5);
 await page.keyboard.press('Shift+ArrowLeft');await settle(0);
 // Repeated side clicks during motion should keep the newest requested spread.
 await page.locator('#edge-next').click();await page.locator('#edge-next').click();await settle(2);
 await page.locator('#language-toggle').click();assert.equal(await page.locator('#book-status').textContent(),'Entry 4');
 await page.locator('#book-close').click();await settle(0);assert.equal(await page.locator('#book-cover').isVisible(),true);
 for(const width of [320,375,768,1440]){
  await page.setViewportSize({width,height:1000});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`English overflow ${width}`);
  const photo=await page.locator('.heetah-portrait').boundingBox(),facts=await page.locator('.profile-ledger').boundingBox();assert.ok(photo.x+photo.width<facts.x);
  const row=await page.locator('.timeline-item').nth(0).boundingBox(),next=await page.locator('.timeline-item').nth(1).boundingBox();assert.ok(row.x+row.width<next.x&&Math.abs(row.y-next.y)<1);
  const nav=await page.locator('header nav').boundingBox(),profile=await page.locator('#open-profile').boundingBox();assert.ok(profile.x+profile.width<=nav.x+nav.width+1);
  await page.locator('#language-toggle').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Chinese overflow ${width}`);await page.locator('#language-toggle').click();
 }
 await page.setViewportSize({width:375,height:1000});await page.locator('#about').screenshot({path:'analysis/layout-about-mobile.png'});
 await page.setViewportSize({width:1440,height:1000});await page.locator('#journey').scrollIntoViewIfNeeded();await page.waitForTimeout(800);await page.locator('#journey').screenshot({path:'analysis/layout-journey-desktop.png'});
 assert.deepEqual(errors,[]);console.log('PASS: summary navigation, simplified book controls, animated five-sheet/reverse/queued turns, chronological projects, two-column experiences, bilingual responsive layout.');
}finally{await browser.close();}
