import { readFileSync, writeFileSync } from 'node:fs';
let html=readFileSync('index.html','utf8');
// Run once to replace the previous video section and put the diary first.
if(!html.includes('id="diary-book"')){
 html=html.replace(/<section id="story"[\s\S]*?<\/section>\s*/,'');
 const book=readFileSync('scripts/book-markup.html','utf8');
 html=html.replace('<main id="main">','<main id="main">\n'+book);
}
html=html.replace(/>yc<span/g,'>Heetah<span');
html=html.replace('class="atlas-center">yc.','class="atlas-center">Heetah');
html=html.replaceAll('Yu Cheng Chang','Heetah').replaceAll('YU CHENG CHANG','HEETAH');
html=html.replace('張宇誠 — A work in progress.','Heetah 張宇誠 — A life in pages.');
html=html.replace(/(<nav[^>]*><a href="#story">)關於我/,'$1日記');
// Keep historical PDF intact; only update the website’s supplied English name.
html=html.replace(/  <link rel="icon"[^\n]+/,'  <link rel="icon" href="/favicon.svg"/>');
writeFileSync('index.html',html);
