import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5173');
 assert.equal(await page.locator('#book-title').textContent(),'用一本書，翻閱大學生活');
 assert.equal(await page.locator('#about .profile-ledger>div').count(),4);
 assert.equal(await page.locator('#about .atlas-tabs,#about .hero-thesis').count(),0);
 assert.match(await page.locator('#about').textContent(),/2026–2027/);
 await page.locator('#about').scrollIntoViewIfNeeded();await page.locator('.heetah-portrait img').evaluate(i=>i.decode());
 const portrait=await page.locator('.heetah-portrait').boundingBox(),ledger=await page.locator('.profile-ledger').boundingBox();assert.ok(portrait.x+portrait.width<ledger.x,'Desktop portrait is left of facts');
 assert.ok(Math.abs(portrait.y+portrait.height-ledger.y-ledger.height)<1,'Portrait bottom aligns with the last fact row');
 assert.ok(portrait.width<=320,'Desktop portrait uses its revised size');
 assert.equal(await page.locator('a[href*="CV.pdf"]').count(),0,'No résumé PDF links remain');
 await page.locator('#about').screenshot({path:'analysis/profile-new-desktop.png'});
 for(const id of ['vision','cloudmile']){await page.locator(`.project-info [data-project="${id}"]`).click();const text=await page.locator('#dialog-body').textContent();if(id==='vision'){assert.match(text,/嘉義縣環保局/);assert.match(text,/93.18%/);assert.match(text,/67.77%/);assert.equal(await page.locator('#dialog-body a').getAttribute('href'),'https://drive.google.com/file/d/185YO6k7B_HgDl7dkWh93oyVYVNSS9TzU/view?usp=sharing');}else{assert.match(text,/PM 與 Solution Architect/);assert.match(text,/OAuth/);assert.match(text,/F1、F2-score/);}await page.keyboard.press('Escape');}
 const software=page.locator('[data-experience="software"]');await software.locator('summary').click();assert.match(await software.textContent(),/沒有實作成功/);assert.match(await software.textContent(),/定期 sync/);assert.equal(await software.locator('.memory-count').textContent(),'01 / 04');await software.locator('.is-current').evaluate(i=>i.decode());
 const ef=page.locator('[data-experience="ef"]');assert.match(await ef.textContent(),/2024 年 7、8 月/);assert.match(await ef.textContent(),/義大利、厄瓜多、德國、法國與捷克/);assert.match(await ef.textContent(),/Jonas Brothers/);
 await page.locator('#language-toggle').click();assert.match(await software.textContent(),/did not successfully implement/);assert.match(await page.locator('#about .profile-ledger').textContent(),/Indonesian language programme/);
 await page.locator('.project-info [data-project="vision"]').click();assert.match(await page.locator('#dialog-body').textContent(),/93.18% precision/);assert.equal(await page.locator('#dialog-body a').textContent(),'Read the project report ↗');await page.keyboard.press('Escape');
 const vision=page.locator('[data-experience="vision"]');await vision.locator('summary').click();assert.equal(await vision.locator('.experience-prose a').textContent(),'Read the project report ↗');await page.locator('#language-toggle').click();assert.equal(await vision.locator('.experience-prose a').textContent(),'閱讀專題彙報 ↗');assert.equal(await vision.getAttribute('open'),'');
 for(const width of [320,375,768]){await page.setViewportSize({width,height:900});const photo=await page.locator('.heetah-portrait').boundingBox(),facts=await page.locator('.profile-ledger').boundingBox();assert.ok(photo.x+photo.width<facts.x,'Portrait stays left of facts');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Overflow ${width}`);}
 await page.setViewportSize({width:375,height:900});await page.locator('#about').screenshot({path:'analysis/profile-new-mobile.png'});
 const image=new URL('../public/media/night-sky.json',import.meta.url);const {readFile}=await import('node:fs/promises');const spec=JSON.parse(await readFile(image,'utf8'));assert.equal(spec.lightRibbons,0);assert.equal(spec.flowParticles,0);
 assert.deepEqual(errors,[]);console.log('PASS: portrait/facts layout, six project dialogs, software outcome/photos, EF copy, bilingual mobile layout, star-only metadata.');
}finally{await browser.close();}
