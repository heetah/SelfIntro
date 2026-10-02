import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173');
 const gallery=page.locator('#memories .memory-carousel');
 await page.locator('#memories').scrollIntoViewIfNeeded();await gallery.locator('.memory-play').click();
 await page.locator('#memory-tab-association').click();
 assert.equal(await gallery.locator('.memory-count').textContent(),'01 / 07');
 await gallery.locator('.memory-next').click();assert.equal(await gallery.locator('.memory-count').textContent(),'02 / 07');
 assert.match(await gallery.locator('.is-current').getAttribute('src'),/association-02/);
 await gallery.locator('.memory-dots button').last().click();await gallery.locator('.memory-next').click();
 assert.equal(await gallery.locator('.memory-count').textContent(),'01 / 07','Wraparound stays in this collection');
 await gallery.locator('.memory-frame').focus();await page.keyboard.press('ArrowRight');assert.equal(await gallery.locator('.memory-count').textContent(),'02 / 07');
 await gallery.locator('.memory-frame').dispatchEvent('pointerdown',{pointerId:3,pointerType:'touch',clientX:600,clientY:400});
 await gallery.locator('.memory-frame').dispatchEvent('pointerup',{pointerId:3,pointerType:'touch',clientX:300,clientY:405});assert.equal(await gallery.locator('.memory-count').textContent(),'03 / 07');
 await page.locator('#memory-tab-aiesec').click();assert.equal(await gallery.locator('.memory-count').textContent(),'01 / 03');
 await page.locator('#memory-tab-ef').click();assert.equal(await gallery.locator('.memory-count').textContent(),'01 / 11');
 await page.locator('#memory-tab-camp').click();await gallery.locator('.memory-play').click();
 await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement.blur());
 await page.waitForTimeout(6400);assert.equal(await gallery.locator('.memory-count').textContent(),'02 / 11','Visible album advances automatically');
 await gallery.locator('.memory-play').click();await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement.blur());
 await page.waitForTimeout(6400);assert.equal(await gallery.locator('.memory-count').textContent(),'02 / 11','Pause is persistent');
 await page.locator('#language-toggle').click();assert.match(await page.locator('#memories h3').textContent(),/Scenes I remember/);
 await page.locator('[data-project="camp"]').first().click();
 assert.match(await page.locator('.camp-overview').textContent(),/Eight months/);
 await page.locator('.camp-story summary').click();assert.match(await page.locator('.camp-story-body').textContent(),/Leave the rest to us/);
 assert.match(await page.locator('.camp-story-author').textContent(),/Heetah/);
 await page.keyboard.press('Escape');await page.locator('#language-toggle').click();await page.locator('[data-project="camp"]').first().click();
 await page.locator('.camp-story summary').click();assert.match(await page.locator('.camp-story-body').textContent(),/剩下的交給我們/);
 assert.match(await page.locator('.camp-story-body').textContent(),/五千小時/);
 await page.screenshot({path:'analysis/camp-story-final.png'});
 for(const width of [320,375,768]){
  await page.setViewportSize({width,height:850});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow ${width}`);
  assert.equal(await page.locator('#project-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true,`Dialog overflow ${width}`);
  if(width===375)await page.screenshot({path:'analysis/camp-mobile-final.png'});
  await page.locator('#project-dialog').evaluate(el=>el.scrollTop=el.scrollHeight);
  const modal=await page.locator('#project-dialog').boundingBox(),close=await page.locator('#project-dialog .dialog-close').boundingBox();
  assert.ok(close.y>=modal.y&&close.y+close.height<=modal.y+modal.height,'Long story keeps its close control within the viewport');
 }
 await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});
 await page.locator('[data-filter="people"]').click();await page.locator('.timeline-item').filter({has:page.locator('summary h3', {hasText:'中正資工營《'})}).locator('summary').click();
 await page.locator('.camp-timeline-link[data-project="camp"]').click();assert.equal(await page.locator('#project-dialog').evaluate(el=>el.open),true,'Camp opens after filtering');
 await page.locator('.camp-source-link').click();assert.equal(await gallery.getAttribute('data-memory-group'),'camp');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#memories .memory-play').disabled);assert.equal(await gallery.locator('.memory-play').isDisabled(),true);
 await page.locator('#open-editor').click();await page.locator('[data-upload="camp"]').setInputFiles('public/memories/aiesec.webp');
 await page.waitForFunction(()=>document.querySelector('.memory-project .memory-count').textContent==='01 / 12');
 await page.keyboard.press('Escape');await page.locator('.memory-project .memory-next').first().click();
 assert.equal(await page.locator('.memory-project .memory-count').first().textContent(),'02 / 12','Device preview preserves published photos');
 // Every supplied published photograph exists and decodes, including single-photo albums.
 const {memoryGroups}=await import('../src/memory-data.js'); const paths=Object.values(memoryGroups).flatMap(group=>group.photos.map(photo=>photo.src.split('/').pop().replace('.webp','')));
 const decoded=await page.evaluate(async paths=>Promise.all(paths.map(async name=>{const image=new Image();image.src=`/memories/${name}.webp`;try{await image.decode();return image.naturalWidth>0;}catch{return false;}})),paths);assert.equal(decoded.every(Boolean),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: grouped photos, autoplay, persistent pause, wraparound, keyboard/swipe, bilingual story, responsive dialog, filters, reduced motion, upload preview and all 60 assets.');
}finally{await browser.close();}
