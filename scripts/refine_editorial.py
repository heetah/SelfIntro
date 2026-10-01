from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
p=root/'index.html'
s=p.read_text(encoding='utf-8')
s=s.replace('Heetah<span>↗</span>','Heetah')
s=s.replace('PERSONAL FIELD NOTES<br>張宇誠 · SINCE 2023','張宇誠<br>資訊工程 · 大學生活紀錄')
s=s.replace('LET’S TALK <span>↗</span>','閱讀履歷 ↗').replace('class="header-contact" href="#connect"','class="header-contact" href="/詳細 CV.pdf" target="_blank" rel="noopener"')
s=s.replace('THE UNIVERSITY YEARS / HEETAH','01 / 大學生活紀錄').replace('每一頁，<em>都是我。</em>','我的大學日記')
s=s.replace('從一圈校園路跑開始，<br>把大學生活，慢慢寫成一本書。','從 2023 年 9 月的環校路跑開始，<br>記下課業、朋友與生活。')
s=s.replace('VOL. 01 / THE UNIVERSITY YEARS','2023 — ONWARDS').replace('<span class="cover-symbol" aria-hidden="true">✳</span>','')
s=s.replace('闔上書 ↗','闔上書').replace('拖動，翻到另一段日常','拖動滑桿，選擇頁面')
s=s.replace('</div>\n  <div class="book-stage"','<a class="book-resume" href="/詳細 CV.pdf" target="_blank" rel="noopener">先閱讀履歷 PDF ↗</a></div>\n  <div class="book-stage"',1)
start=s.index(' <div class="hero-eyebrow">');end=s.index('<div class="personal-atlas">',start)
s=s[:start]+''' <div class="hero-heading"><div class="hero-title-block"><span class="hero-pretitle">02 / 關於我</span><h2 id="hero-title">張宇誠 <span>Heetah</span></h2><p class="hero-thesis">國立中正大學資訊工程學系四年級。<br>我參與遊戲開發，也在資工營、系學會與 AIESEC 中學習團隊合作。這裡收錄我的日常、作品，以及在不同團隊裡承擔的工作。</p></div>'''+s[end:]
start=s.index('<div class="atlas-caption">');end=s.index('<div class="atlas-tabs"',start)
s=s[:start]+'''<div class="atlas-caption">學習與參與</div><dl class="profile-ledger"><div><dt>學習領域</dt><dd>資訊工程、遊戲開發、生成式 AI</dd></div><div><dt>實習經歷</dt><dd>CloudMile · GenAI Intern · 2026</dd></div><div><dt>校園參與</dt><dd>中正資工營、系學會、AIESEC</dd></div></dl>'''+s[end:]
s=s.replace('從遊戲開發，到生成式 AI。<br>讓想法有機會走出筆記本。','Sliding 遊戲開發專案：擔任六人團隊組長，完成逾 20 個關卡。')
s=s.replace('<span class="atlas-foot">THREE THREADS. ONE ONGOING STORY.</span>','')
start=s.index(' <div class="hero-bottom">');end=s.index('</section>',start)
s=s[:start]+''' <div class="hero-bottom"><p class="about-caption">日記之外，以下是我的專案與參與經歷。</p><div class="hero-actions"><button class="pill primary-pill" id="open-profile">個人摘要</button><a class="text-link" href="/詳細 CV.pdf" target="_blank" rel="noopener">閱讀完整履歷 PDF ↗</a></div></div>
'''+s[end:]
s=re.sub(r'<div class="ticker".*?</div></div>','',s,flags=re.S)
s=re.sub(r'<section class="glance section".*?</section>','',s,flags=re.S)
s=re.sub(r'<section class="manifesto section".*?</section>','',s,flags=re.S)
s=s.replace('02 / SELECTED WORK','03 / 專案與活動').replace('從想法，到可以玩的世界。','作品內容與我的角色')
s=s.replace('Built with<br><span class="serif">curiosity.</span>','作品與實作').replace('我喜歡動手做出東西。<br>也喜歡和團隊一起，讓想法成形。','遊戲開發與營隊籌備，<br>是我在課堂之外參與的兩項實作。')
start=s.index('<div class="game-art"');end=s.index('<img class="uploaded-art"',start)
s=s[:start]+'''<div class="project-cover project-cover-game"><span>程式設計（二）／期末專案</span><strong>Sliding</strong><p>彈跳遊戲開發</p><small>專案組長 · 六人團隊</small><span class="project-read">閱讀專案介紹 →</span></div>'''+s[end:]
start=s.index('<div class="camp-art"');end=s.index('<img class="uploaded-art"',start)
s=s[:start]+'''<div class="project-cover project-cover-camp"><span>校園活動／2025</span><strong>中正資工營</strong><p>活動統籌與技術開發</p><small>總召集人 · 技術開發組組長</small><span class="project-read">閱讀參與紀錄 →</span></div>'''+s[end:]
s=s.replace('03 / PEOPLE, PLACES & POSSIBILITIES','04 / 經歷').replace('和不同的人，一起前進。','依年份整理').replace('More than<br><span class="serif">a résumé.</span>','學習與參與經歷').replace('從專案組長，到國際交流與校園服務。<br>每一個角色，都讓我多看見一種可能。','包含實習、課程專案與校園參與。<br>點選項目可閱讀工作內容。')
start=s.index('<section id="connect"');end=s.index('</section>',start)+len('</section>')
s=s[:start]+'''<section id="connect" class="connect section"><div><span class="tiny">完整資料</span><h2>閱讀我的履歷</h2><p>學歷、專案與參與經歷，整理於 PDF 中。</p></div><a class="pill primary-pill" href="/詳細 CV.pdf" target="_blank" rel="noopener">開啟履歷 PDF ↗</a></section>'''+s[end:]
s=s.replace('A WORK IN PROGRESS.','大學生活與作品紀錄').replace('BACK TO TOP ↑','回到頂端 ↑').replace('持續的證據','大學生活日記').replace('創作的成果','遊戲開發專案')
p.write_text(s,encoding='utf-8')
p=root/'src/main.js';s=p.read_text(encoding='utf-8');s=s.replace("import './book.js';","import './book.js';\nimport './editorial.css';")
s=s.replace("build:'從遊戲開發，到生成式 AI。\\n讓想法有機會走出筆記本。',connect:'從 AIESEC，到資工營與系學會。\\n和不同的人，把一件事做好。',persist:'從 2023 年 9 月開始的路跑日記。\\n每一次記錄，都是下一次的起點。'","build:'Sliding 遊戲開發專案：擔任六人團隊組長，完成逾 20 個關卡。',connect:'參與 AIESEC 國際交流，並擔任中正資工營總召與系學會副會長。',persist:'自 2023 年 9 月開始記錄環校路跑，逐漸加入照片與生活分享。'")
p.write_text(s,encoding='utf-8')
