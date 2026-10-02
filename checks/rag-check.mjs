import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';

// A separate Vite process exercises the configured endpoint without a real AI service.
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5174','--strictPort'],{env:{...process.env,VITE_RAG_ENDPOINT:'/api/chat'},stdio:'ignore'});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173');
 await page.locator('.rag-open').click();
 await page.locator('#rag-question').waitFor();
 assert.equal(await page.locator('#rag-question').evaluate(el=>el===document.activeElement),true);
 await page.locator('.rag-suggestions button').first().click();
 assert.match(await page.locator('.rag-assistant').textContent(),/非模型生成/);
 assert.equal(await page.locator('.rag-sources a').count(),1);
 assert.ok((await page.locator('.rag-sources a').getAttribute('href')).endsWith('#work'));
 assert.equal(await page.locator('.rag-sources a[href*="CV.pdf"]').count(),0);
 await page.locator('#rag-question').fill('我的研究方向？');await page.keyboard.press('Enter');
 assert.match(await page.locator('.rag-assistant').last().textContent(),/尚未連接/);
 await page.locator('#rag-clear').click();assert.equal(await page.locator('.rag-message').count(),0);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('.rag-open').evaluate(el=>el===document.activeElement),true);
 await page.locator('#language-toggle').click();await page.locator('.rag-open').click();
 assert.match(await page.locator('#rag-title').textContent(),/About Heetah/);
 await page.locator('.rag-suggestions button').first().click();
 assert.match(await page.locator('.rag-assistant').textContent(),/six-person/);
 await page.screenshot({path:'analysis/rag-desktop.png'});
 await page.locator('.rag-sources a').first().click();
 assert.equal(await page.locator('#rag-dialog').evaluate(el=>el.open),false);
 assert.equal(new URL(page.url()).hash,'#work');
 for(const width of [320,375,768]){
  await page.setViewportSize({width,height:740});await page.locator('.rag-open').click();
  await page.waitForTimeout(350); // Capture after the panel's entrance animation.
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Page overflow ${width}`);
  assert.equal(await page.locator('.rag-panel').evaluate(el=>el.scrollWidth<=el.clientWidth),true,`Panel overflow ${width}`);
  const composer=await page.locator('.rag-composer').boundingBox();assert.ok(composer.y+composer.height<=741,`Composer visible ${width}`);
  const panel=await page.locator('.rag-panel').boundingBox();assert.equal(Math.round(panel.width),Math.min(510,width),'Full mobile viewport');
  if(width===375)await page.screenshot({path:'analysis/rag-mobile.png'});
  await page.keyboard.press('Escape');
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.rag-invitation').scrollIntoViewIfNeeded();await page.screenshot({path:'analysis/rag-entry.png'});
 for(let attempts=0;attempts<40;attempts++){
  try{await fetch('http://127.0.0.1:5174');break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}
 }
 await page.goto('http://127.0.0.1:5174');
 let payload,requests=0;
 await page.route('**/api/chat',async route=>{
  payload=route.request().postDataJSON();requests++;
  if(requests===2)return route.fulfill({status:503,body:'unavailable'});
  await route.fulfill({json:{answer:'Grounded answer <img src=x onerror=alert(1)>',sources:[{title:'Project',url:'#work'},{title:'Unsafe',url:'javascript:alert(1)'}]}});
 });
 await page.locator('.rag-open').click();await page.locator('#rag-question').fill('Tell me about Sliding');await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelectorAll('.rag-assistant')[0]?.textContent.includes('Grounded answer'));
 assert.equal(payload.message,'Tell me about Sliding');assert.deepEqual(payload.history,[]);
 assert.equal(await page.locator('.rag-assistant img').count(),0,'Backend content is plain text');
 assert.equal(await page.locator('.rag-sources a').count(),1,'Unsafe source URL excluded');
 await page.locator('#rag-question').fill('Next question');await page.keyboard.press('Enter');
 await page.locator('.rag-retry').waitFor();assert.equal(payload.history.length,2);
 await page.locator('.rag-retry').click();await page.waitForFunction(()=>document.querySelectorAll('.rag-assistant').length===3);
 assert.equal(payload.history.length,2,'Retry does not repeat current question');
 await page.unroute('**/api/chat');
 await page.route('**/api/chat',()=>new Promise(()=>{}));
 await page.locator('#rag-question').fill('Stop this request');await page.keyboard.press('Enter');
 await page.locator('#rag-stop').click();
 await page.waitForFunction(()=>document.querySelector('.rag-assistant:last-child')?.textContent.includes('停止')||document.querySelector('.rag-assistant:last-child')?.textContent.includes('stopped'));
 assert.equal(await page.locator('.rag-send').isEnabled(),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: RAG preview, bilingual UI, focus, sources, responsive layout, backend contract, retry, cancellation and text safety.');
}finally{await browser.close();server.kill();}
