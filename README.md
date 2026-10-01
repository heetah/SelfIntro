# Heetah — A life in pages

個人網站以大學日記書為首頁入口，並收錄個人介紹、Sliding 遊戲專案、資工營與其他經歷。文案以履歷和既有資料為依據；未提供的成果不作推測。

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

建置結果在 `dist/`，可部署至靜態網站主機。網站目前尚未對外部署。

## 網站導覽

頁首導覽包含日記、關於我、作品與經歷；右側可切換繁中／英文及動態設定。英文介面不改寫原始日記圖片或履歷 PDF。手機版導覽採兩列顯示。

首頁也可直接開啟履歷 PDF。根目錄的 `詳細 CV.pdf` 是私人來源檔並列入 `.gitignore`；網站使用的公開副本為 `public/詳細 CV.pdf`。更新履歷時，請確認可以公開，再自行更新公開副本。

## 日記書操作

- 點擊封面打開日記。日記從成長序章開始，之後依來源順序顯示雙頁。
- 點擊書本兩側翻到前一組或下一組雙頁。下方 `←` / `→` 是單次翻頁，`«` / `»` 快翻五組雙頁。
- 也可拖動滑桿跳頁、用方向鍵翻頁，或按 Shift 加方向鍵快翻五組。
- 在手機上向左或向右滑動可翻頁。點擊日記圖片可放大，並在放大視窗中前後閱讀；關閉後會回到相應雙頁。
- 闔上書本會回到封面。系統或頁首的減少動態設定會停止裝飾動畫。

日記原圖保留來源文字。書本背景使用 `public/media/night-sky.mp4`，由 `scripts/render_night.py` 以 NumPy 繪製並透過 FFmpeg 編碼成 12 秒循環影片。網站共用一份解碼影片；翻頁時暫停星空影格更新，降低額外負擔。

## 星空素材重製

需安裝 Python、NumPy、Pillow 及 FFmpeg。在專案根目錄執行：

```powershell
python scripts/render_night.py
```

腳本會更新 `public/media/night-sky.mp4`、海報及影片規格資料。這些素材供網站使用，應隨網站原始碼一併提交。

## 日記資料與來源影片

網站顯示的日記圖文與頁序檔案放在 `public/diary/` 及 `public/diary/pages.json`。它們是網站實際使用的內容，靜態部署需要包含這些檔案。序號表示收錄順序，不代表一天一篇；沒有透過 OCR 改寫日記，也沒有補造日期。

原始來源 `jogging_timelapse_6fps.mp4` 約 226 MB，因檔案大且包含私人日記，已列入 `.gitignore`。從原始影片重製頁序需在本機自行保管來源檔，並執行：

```powershell
python scripts/measure_diary_changes.py
python scripts/build_diary_manifest.py
```

這兩個腳本需要 OpenCV、NumPy 與 Pillow。OCR 萃取腳本只供分析，並非目前公開日記頁面的產生流程。選頁方法與限制見 [`analysis/diary-book-evidence.md`](analysis/diary-book-evidence.md)；已審閱頁序見 [`analysis/diary-page-selection.json`](analysis/diary-page-selection.json)。原影片分析畫格、截圖及其他中間資料由 `.gitignore` 排除。

## 圖片與專案

頁尾「編輯圖片」可在目前裝置預覽並以 IndexedDB 儲存 Sliding 與資工營照片；本機上傳不會自動公開給其他訪客。要提供正式網站圖片，請把可公開的素材放入 `public/images/`，並設定 `src/images.js`：

```js
export const publishedImages = {
  sliding: '/images/sliding.webp',
  camp: '/images/camp.webp',
};
```

未上傳照片時，作品區使用 CSS 文字封面。作品細節與經歷資料分別位於 `src/main.js` 及 `index.html`。

## 測試與設計資料

先執行 `npm run dev`，再執行：

```powershell
node checks/browser-check.mjs
node checks/night-language-check.mjs
node checks/quick-turn-check.mjs
```

這些檢查涵蓋翻頁與邊界、五組快翻、中英文切換、手機版面、圖片預覽及既有互動。輸出的截圖與效能資料位於 `analysis/`，不納入 Git。

動畫設計與參數說明見 [`analysis/book-motion.md`](analysis/book-motion.md)。本網站使用瀏覽器 3D 動畫，不是 Blender 紙張物理模擬。整體視覺方向見 [`design-prompt.txt`](design-prompt.txt)。

## Git 忽略規則

`.gitignore` 排除依賴、建置結果、私人來源 CV、原始大影片、測試輸出與分析中間檔。保留網站實際使用的 `public/diary/`、星空素材、公開 CV、副程式、測試及 README 引用的分析說明。加入其他個人資料前，請確認它是否適合放入 Git 與公開網站。

字型使用 Google Fonts 的 Noto Serif TC 與 Cormorant Garamond；離線時使用系統備援字型。日記部分經歷來源時間標記仍沿用原始 CV，若需統一學期與年份，請先核對原始資料。
