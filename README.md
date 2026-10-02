# Heetah — A life in pages

個人網站以大學日記書為首頁入口，並收錄個人介紹、Sliding 遊戲專案、資工營與其他經歷。中英文文案參考全頁日記文字、關鍵原圖、履歷與作者手記；未提供的成果不作推測。

## 本機啟動

```powershell
npm install
npm run dev
```

使用終端提供的本機網址，預設為 <http://127.0.0.1:5173>。正式建置與預覽：

```powershell
npm run build
npm run preview
```

建置結果在 `dist/`，可部署至靜態網站主機。網站目前尚未對外部署；RAG 問答服務需另外部署後端。

## 網站導覽

頁首導覽包含日記、關於我、作品與經歷；右側可切換繁中／英文。動態預設開啟，已移除動態開關；系統減少動態偏好仍會套用。英文介面不改寫原始日記圖片與外部來源文件。手機版導覽採兩列顯示。

已移除頁首、書籍、個人介紹、個人摘要與問答預覽中的履歷 PDF 連結。畢業專題介紹、經歷段落與頁尾作品入口改為提供作者指定的「專題彙報」Google Drive 連結。既有 PDF 檔案未刪除；原有 public 副本仍是靜態資產，但網站不再連結至該檔案。

章節背景以紙纖維、淡星圖、低對比工程格線與縱線建立層次，深入作品區以深墨綠星空呼應書封。背景樣式位於 `src/background.css`，靜態 SVG 素材位於 `public/textures/`；裝飾不接收點擊，也不增加動畫、影片或 canvas。

## 日記書操作

- 點擊封面打開日記。日記從成長序章開始，之後依來源順序顯示雙頁。
- 點擊書本兩側翻到前一組或下一組雙頁。下方依序只顯示影片連結、目前日記篇次與闔書按鈕。
- 可用方向鍵翻頁，或按 Shift 加方向鍵快翻五組；已移除滑桿與額外翻頁按鈕。
- 在手機上向左或向右滑動可翻頁。點擊日記圖片可放大，並在放大視窗中前後閱讀；關閉後會回到相應雙頁。
- 闔上書本會回到封面。系統的減少動態設定會停止裝飾動畫。

日記原圖保留來源文字。書本背景使用 `public/media/night-sky.mp4`，由 Figma 製作約 12 秒的星辰與星芒閃爍動畫（已移除光帶與移動光點），再透過 FFmpeg 壓縮。網站共用一份解碼影片；翻頁時暫停星空影格更新，降低額外負擔。

## RAG 對話介面

「關於我」區域的「詢問我的背景」開啟問答面板：桌面版由右側滑入，手機版使用整個視窗。支援中英文、建議問題、對話紀錄、來源連結、重新開始、錯誤重試及停止請求。Enter 送出，Shift + Enter 換行；Esc 關閉。對話只保留於目前頁面的記憶體，重新整理即清除。

目前已完成前端與後端連接契約，尚未提供檢索、向量資料庫或模型服務。未設定服務時，建議問題顯示人工整理的公開網站資料，明確標示「網站資料預覽 · 非模型生成」；自由提問會提示服務尚未連接。

要連接後端，在根目錄建立 `.env.local`（可參考 `.env.example`）：

```dotenv
VITE_RAG_ENDPOINT=/api/chat
```

修改後需重新啟動 Vite，正式部署需重新建置。此變數是公開的服務網址；模型 API 金鑰僅放在後端。使用 `/api/chat` 時需由部署主機或開發代理轉送至你的後端；本專案沒有這個 API 路由。跨來源服務需允許網站來源的 CORS 請求。

前端以 `POST` 傳送 JSON，`history` 是先前有效的對話，不含本次 `message` 或載入／錯誤提示。`context.diarySpread` 是從零開始的雙頁索引，供後端判斷目前閱讀位置。

```json
{
  "message": "Sliding 專案中，你負責什麼？",
  "language": "zh",
  "history": [],
  "context": { "section": "#about", "diarySpread": 0 }
}
```

後端應以允許公開的履歷、專案和日記文字檢索資料，依來源回答；資料不足時說明不足。後端需回傳非空的 `answer`，以及可選的 `sources`；來源應由檢索文件的中繼資料產生。`language` 為 `zh` 或 `en`。

```json
{
  "answer": "我擔任六人遊戲開發團隊的組長。",
  "sources": [{ "title": "Sliding · 專案介紹", "url": "#work" }]
}
```

回答以純文字呈現。來源連結接受同來源 HTTP／HTTPS 或外部 HTTPS；頁內來源會關閉面板並移至對應章節。實作位於 `src/rag.js` 與 `src/rag.css`。

## 星空素材重製

目前正式素材的設計來源為 [Figma 星辰動畫](https://www.figma.com/design/SOKJQxuJq21gKpgswYzGZO)，根節點 `1:4`。以 640 × 800、24 fps 匯出 MP4，再用 FFmpeg 編碼為 H.264 / yuv420p，加入 faststart；另外擷取海報。設計與輸出規格見 `artwork/night-sky.design.json`，美術數值不代表物理參數。正式 MP4、海報與規格資料應隨網站提交。

`scripts/render_night.py` 保留較早的 NumPy 版本，執行後會覆寫目前 Figma 素材；僅在刻意回復旧版本時使用。它需要 Python、NumPy、Pillow 與 FFmpeg：

```powershell
python scripts/render_night.py
```

如需修改目前視覺，請編輯上述 Figma 設計並重新匯出。

## 個人資料、人格特質與作品分段

關於我以左側 `memory_pics/heetah.jpg` 頭像、右側四項資料呈現；手機依序排列。學習領域、校園參與、2026–2027 CloudMile 實習、活動參與依作者最新提供內容更新。原圖轉成 `public/memories/heetah.webp`，不加入相簿總數。

軟體工程寫明最後未能實作成功，說明 Multi-Agent、系統文件與定期 sync 的學習；四張新照片放在對應經歷。EF Miami 依作者提供的 2024 年 7、8 月、朋友國籍與活動回憶重寫。畢業專題沒有提供照片，以文字視覺呈現，不冒用其他經歷的照片。

關於我之後加入 `src/personality.js` 的雙語人格特質介紹：好奇與實作、責任與合作、真誠與交流、韌性與自省。以第一人稱經歷說明，不推測人格測驗類型。支援點擊、方向鍵、Home / End，切換語言保留選項。

六項作品改為獨立章節，各有編號、類別、年份、簡介與相簿／圖片。桌面以圖文兩欄呈現，手機依序排列；原本的詳細介紹、輪播與本機上傳功能保留。

## 日記資料與來源影片

網站顯示的日記圖文與頁序檔案放在 `public/diary/` 及 `public/diary/pages.json`。它們是網站實際使用的內容，靜態部署需要包含這些檔案。序號表示收錄順序，不代表一天一篇；沒有透過 OCR 改寫日記，也沒有補造日期。

原始來源 `jogging_timelapse_6fps.mp4` 約 226 MB，因檔案大且包含私人日記，已列入 `.gitignore`。從原始影片重製頁序需在本機自行保管來源檔，並執行：

```powershell
python scripts/measure_diary_changes.py
python scripts/build_diary_manifest.py
```

這兩個腳本需要 OpenCV、NumPy 與 Pillow。OCR 萃取腳本只供分析，並非目前公開日記頁面的產生流程。選頁方法與限制見 [`analysis/diary-book-evidence.md`](analysis/diary-book-evidence.md)；已審閱頁序見 [`analysis/diary-page-selection.json`](analysis/diary-page-selection.json)。原影片分析畫格、截圖及其他中間資料由 `.gitignore` 排除。

## 文案來源審閱

本次以 `scripts/read_diary_text.py` 讀取全部 551 個公開日記影像的全頁文字，中文與英文皆納入審閱。551 是影片收錄畫格／頁序數，不是 551 個不同日期；來源有重複畫面、合併日數與暫停更新的時段。OCR 有誤字，重要引用需核對原圖，並不等於逐字人工校訂的正式逐字稿。

重製文字擷取需 Python、OpenCV、`rapidocr_onnxruntime`。執行 `python scripts/read_diary_text.py`，結果與 SHA-256 快取保存在 `analysis/diary-text/`（不提交、不部署），同目錄 `coverage.json` 記錄覆蓋數與空頁。模型沿用預設設定；worker 與推論執行緒限制只用於控制本機資源。各段文案對應的來源與年份差異見 [`analysis/editorial-source-map.md`](analysis/editorial-source-map.md)。

網站介紹是整理後的自傳，原始日記圖文保持不變。Sliding 的 2024 年展示時間由原始日記確認；履歷的學期標示與日記日期存在差異，來源檔保留原件。未確認的研究數值、雲端效能、實習專案與遊戲上架成果，不寫成已驗證事實。

## 圖片與專案

`memory_pics/` 的 60 張圖片已分成總召、技術組、香舞、系學會、AIESEC、冬返、CloudMile、Sliding、EF、啦啦隊、軟體工程與 FESHx.BIPA 12 組。展開對應經歷即可閱讀段落與輪播照片，也可在「記憶中的現場」切換全部分類。「作品與實作」依序展示 Sliding、系學會副會長、資工營總召、資工營技術組、畢業專題、實習經歷六張作品卡（依起始年份排序，同年角色保留原相對順序），各有獨立介紹與照片；香舞仍保留在經歷区。總召照片按籌備、颱風、營期、夥伴與慶功的敘事順序排列，不推測拍攝日期。多張照片每六秒淡入切換，可暫停、用箭頭／圓點選頁、在照片區使用方向鍵或手機橫向滑動。滑鼠停留、鍵盤聚焦、照片離開畫面、頁面隱藏或減少動態模式時，自動播放停止。只有一張的分類不顯示翻頁控制。

網站使用 `public/memories/` 中的 WebP 副本，保留人物與照片完整比例，轉檔時不放大低解析原圖；`Sliding_demo.png` 也已作為 Sliding 的預設圖片。原始 `memory_pics/` 列入 `.gitignore`，公開副本需隨網站部署。重製需 Pillow：

```powershell
python scripts/prepare_memories.py
```

照片分類與順序在 `src/memory-data.js`。資工營概述與作者提供的完整總召手記在 `src/camp-story.js`，包含英文翻譯；原文的敘事、日期與星期照錄。作品視窗與經歷項目可開啟手記。

頁尾「編輯圖片」可在目前裝置預覽並以 IndexedDB 儲存 Sliding 與資工營照片；本機上傳不會自動公開給其他訪客。要提供正式網站圖片，請把可公開的素材放入 `public/images/`，並設定 `src/images.js`：

```js
export const publishedImages = {
  sliding: '/images/sliding.webp',
  camp: '/images/camp.webp',
};
```

Sliding 預設顯示原始專案圖，資工營作品區顯示各角色照片；上傳只影響本機預覽。雙語經歷與專案段落位於 `src/experience-data.js`，畫面由 `src/experience-view.js` 呈現；首頁段落位於 `src/editorial-copy.js`。切換語言會保留展開狀態、焦點與目前照片。

## 測試與設計資料

先執行 `npm run dev`，再執行：

```powershell
node checks/browser-check.mjs
node checks/night-language-check.mjs
node checks/quick-turn-check.mjs
node checks/rag-check.mjs
node checks/memories-check.mjs
node checks/editorial-check.mjs
node checks/character-design-check.mjs
node checks/profile-content-check.mjs
```

這些檢查涵蓋翻頁與邊界、五組快翻、中英文切換、手機版面、圖片預覽及既有互動。記憶照片檢查涵蓋分組、自動播放／暫停、鍵盤與滑動、長文視窗、篩選後的入口與 60 張素材解碼。文案檢查涵蓋六項作品分類、Sliding 指定文案、香舞籌備角色，以及切換語言後保留展開狀態與照片。RAG 檢查另在 5174 埠暫時啟動 Vite，以模擬服務驗證請求契約、重試、中止、來源與純文字呈現，不呼叫模型。輸出的截圖與效能資料位於 `analysis/`，不納入 Git。

動畫設計與參數說明見 [`analysis/book-motion.md`](analysis/book-motion.md)。本網站使用瀏覽器 3D 動畫，不是 Blender 紙張物理模擬。整體視覺方向見 [`design-prompt.txt`](design-prompt.txt)。

## Git 忽略規則

`.gitignore` 排除依賴、建置結果、私人來源 CV、原始大影片、測試輸出與分析中間檔。保留網站實際使用的 `public/diary/`、星空素材、公開 CV、副程式、測試及 README 引用的分析說明。加入其他個人資料前，請確認它是否適合放入 Git 與公開網站。

字型使用 Google Fonts 的 Noto Serif TC 與 Cormorant Garamond；離線時使用系統備援字型。日記部分經歷來源時間標記仍沿用原始 CV，若需統一學期與年份，請先核對原始資料。

## 專題與實習內容更新（2026-10-02）

透過 Google Drive 查閱 17 份專題進度簡報及反追蹤數學推導、時間成本分析，另比對「專題彙報」文件與 PDF。中英內文已更新合作對象、模型分工、反追蹤方法及實習學習。93.18% Precision、67.77% Recall 與 78.47% F1-score 為彙報中 406 部垃圾案例影片的評估結果，不宣稱為獨立跨場域測試或單一反追蹤模組績效；早期 35/58 的歸因比例與它不可直接相減。來源與口徑見 `analysis/editorial-source-map.md`。

桌面頭像最大寬度調整為 320px，與右側活動參與欄的底線對齊；手機維持上下排列。

個人摘要入口位於頂端導覽列；「關於我」在手機上保持左側照片、右側資料並排。「經歷」採全寬介紹與每列兩項的展開式卡片，篩選、照片輪播與中英文切換均保留。
