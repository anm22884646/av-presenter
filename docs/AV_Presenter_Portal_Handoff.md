# AV Presenter — 入口網站上架交接文件

- 交接日期：2026-10-06
- 目前發布版本：0.2.0
- 發布狀態：首次公開測試版（Pre-release）
- 適用平台：Windows x64，主要驗證目標為 Windows 11
- 公開專案：https://github.com/anm22884646/av-presenter
- 本文件用途：讓入口網站開發者新增 AV Presenter 工具字卡、功能介紹、操作指南與下載入口。

## 1. 本次入口網站任務

請在既有入口網站的工具清單加入 **AV Presenter**，沿用現有網站的導覽、字卡與視覺規則。不要把它描述成可直接在網站上執行的工具；它是需要下載的 Windows 桌面應用程式。

交付內容：

1. 工具清單中的 AV Presenter 字卡。
2. 功能介紹與使用情境。
3. 簡明操作指南與展覽自動啟動說明。
4. Windows 執行版下載按鈕、Release 頁面及 GitHub 專案連結。
5. 版本、平台、測試版狀態與目前限制。

若入口網站已有工具詳情頁，沿用既有詳情頁模式；若只有字卡，可使用既有的展開區塊呈現指南。不要為本次上架重做整個網站。

## 2. 產品定位

AV Presenter 是供小型展覽、企業活動與會議使用的輕量 Windows 播放與畫面疊加工具。

操作員可播放影片或圖片，疊加即時時鐘、倒數與多行文字，在控制螢幕預覽後，再把乾淨的畫面送往展示螢幕。

核心流程：

**加入媒體 → 編輯文字／時鐘／倒數 → 檢查 Preview → TAKE → Program 播出**

適合：

- 小型展覽：循環播放展示影片、加入展區標題與時間。
- 企業活動：下一場議程、休息公告、開場倒數。
- 會議室與舞台回看螢幕：顯示時鐘、倒數或提示文字。
- 展示螢幕：每日登入 Windows 後自動載入既定內容並開啟輸出。

定位是簡單的現場播放與疊加工具。不要宣稱它是完整媒體伺服器、專業導播系統或 PowerPoint 播放器。

## 3. 可直接使用的字卡文案

### 正體中文

- **名稱**：AV Presenter
- **副標題**：輕量現場播放與畫面疊加工具
- **摘要**：播放影片與圖片，疊加時鐘、倒數及文字。先預覽、再 TAKE 到展示螢幕，也能保存設定並在登入 Windows 後自動恢復展示。
- **平台標籤**：Windows x64
- **功能標籤**：雙螢幕輸出、Preview／Program、時鐘與倒數、設定還原
- **版本標籤**：v0.2.0 · 公開測試版
- **主要按鈕**：下載 Windows 版
- **次要按鈕**：功能與操作指南
- **補充連結**：版本說明／GitHub 專案

### English（若入口網站使用英文）

- **Name**: AV Presenter
- **Subtitle**: Lightweight event playback and overlays
- **Summary**: Play videos and images with live clock, countdown, and text overlays. Prepare in Preview, TAKE to a clean display output, and restore saved exhibition settings at Windows login.
- **Primary CTA**: Download for Windows
- **Secondary CTA**: Features & User Guide
- **Status**: v0.2.0 · Public testing release

字卡不需要塞入所有操作說明；完整功能與限制放在詳情區。名稱固定使用 AV Presenter，不翻譯產品名稱。

沒有已提供的正式 Logo 或產品截圖時，可使用網站現有的螢幕／播放圖示。不要假造操作畫面，或把示意畫面標成實際截圖。

## 4. 功能介紹

### 4.1 控制與輸出分離

- Control 控制視窗顯示媒體清單、預覽、播出監看、疊加編輯與輸出設定。
- Output 輸出視窗只顯示 Program 內容，不顯示控制介面、選單或標題列。
- 可選擇輸出螢幕；多螢幕時使用乾淨的無邊框全螢幕輸出。
- 切換輸出螢幕不需重啟應用程式。
- 單螢幕時提供視窗模式輸出。
- 控制端顯示輸出狀態與螢幕中斷提示。

### 4.2 Preview／Program 工作流程

- Preview 是準備區，Program 是正在播出的內容。
- 在 Preview 修改文字、時鐘、倒數或選擇媒體，不會直接改動 Program。
- 按 TAKE 才把 Preview 場景送到 Program。
- CLEAR OVERLAYS 只隱藏 Program 的文字、時鐘與倒數；背景媒體繼續播放。
- Control 內有獨立的 Preview 與 Program 監看畫面。

### 4.3 媒體播放

- 影片：MP4、WebM。
- 圖片：JPG、JPEG、PNG。
- 使用 Windows 原生檔案選擇器匯入媒體，並保留簡單的媒體清單。
- 可選黑色背景，不一定需要媒體。
- 支援播放、暫停、重新播放、循環。
- Preview 與 Program 有各自的播放控制。
- 聲音從 Output 播放；Control 內的兩個監看畫面靜音。
- 載入失敗或檔案遺失時，在 Control 顯示錯誤。

MP4 建議先使用 H.264 編碼，實際可播放的編解碼器取決於 Electron 支援範圍。不要宣稱支援所有 MP4／影片格式。

### 4.4 即時時鐘

- 依本機系統時間更新，不受影片播放／暫停影響。
- 格式：HH:mm、HH:mm:ss、YYYY/MM/DD HH:mm。
- 可調整啟用狀態、字型、字體大小、字重、文字顏色、對齊、X／Y 百分比位置、內距、背景顏色與不透明度。

### 4.5 倒數計時

- 可輸入 MM:SS 或 HH:MM:SS，例如 10:00、00:30、01:30:00。
- 支援開始、暫停、重設。
- 可在 Preview 準備倒數，再透過 TAKE 送到 Program。
- 專用的 Program 倒數控制會立即操作播出中的倒數。
- 可調整字型、大小、位置、顏色、對齊、內距與背景。
- 僅修改無關的文字或樣式再 TAKE，不會重設原本的 Program 倒數。

### 4.6 多行文字疊加

- 目前支援一個文字疊加層，可輸入多行文字。
- 可調整字型、大小、字重、對齊、文字顏色、X／Y 位置、內距與背景。
- 提供左上、上方置中、右上、中央、左下、下方置中、右下的位置預設。
- 文字顯示在背景媒體之上。

### 4.7 四語操作介面

- English
- 日本語
- 正體中文
- 简体中文

切換語言會更新操作介面並記住偏好，不會翻譯使用者輸入的文字或改動 Program 內容。

### 4.8 保存與還原設定

- SAVE CURRENT SETTINGS 保存 Preview、Program、文字／時鐘／倒數樣式、倒數狀態、媒體參照與輸出螢幕。
- 勾選「下次啟動時還原目前狀態」後，後續變更會自動儲存。
- 啟動時還原已保存的場景、播放／循環設定，以及原本啟用的輸出。
- 倒數從儲存時的剩餘時間繼續，不扣除程式關閉期間的時間。
- 影片重新從開頭載入，不保存精確播放位置。
- 儲存的展示螢幕不可用時，等待它重新連線，不默默把第二螢幕輸出移到控制主螢幕。

### 4.9 Windows 登入自動啟動

- 可勾選「登入 Windows 後自動啟動」。
- 配合設定還原，可在每天登入 Windows 後恢復展示。
- 需要已封裝的 Windows 執行版；原始碼開發模式不提供登入自動啟動選項。
- 不負責電腦開機、BIOS 斷電復電設定或 Windows 自動登入。

## 5. 下載入口與檔案

以下是目前已公開的 0.2.0 連結，不需要 GitHub 帳號即可下載。

| 用途 | URL |
| --- | --- |
| Windows x64 執行版 | https://github.com/anm22884646/av-presenter/releases/download/v0.2.0/AV-Presenter-Windows-x64-0.2.0.zip |
| 0.2.0 版本說明 | https://github.com/anm22884646/av-presenter/releases/tag/v0.2.0 |
| 所有發布版本 | https://github.com/anm22884646/av-presenter/releases |
| 原始碼 ZIP | https://github.com/anm22884646/av-presenter/releases/download/v0.2.0/AV-Presenter-Source-0.2.0.zip |
| SHA-256 檢查碼 | https://github.com/anm22884646/av-presenter/releases/download/v0.2.0/SHA256SUMS.txt |
| GitHub 專案 | https://github.com/anm22884646/av-presenter |
| Windows 驗收指南 | https://github.com/anm22884646/av-presenter/blob/main/WINDOWS-VALIDATION.md |

- Windows ZIP 大小：147,283,433 bytes，約 140 MiB（147 MB）。字卡可簡寫「約 140 MB」。
- 發布附件是完整 ZIP，不需分卷合併。
- 這是 Pre-release；不要使用 GitHub `/releases/latest` 當作目前下載入口，它不保證指向這個測試版。
- 字卡版本固定顯示 0.2.0，下載連結也要對應 0.2.0；未來更新時一起更換版本、檔名、大小與說明。
- 網頁的下載動作應直接使用 GitHub 連結，不要指向 `/workspace`、`sandbox:` 或開發機的檔案路徑。
- 跨網域的 HTML `download` 屬性不保證強制下載；以正常 HTTPS 連結導向附件即可。
- 目前只有 Windows x64 執行包。不要放置尚不存在的 macOS、Linux、ARM64 或安裝程式按鈕。

## 6. 使用者快速開始

### 6.1 首次啟動

1. 下載 Windows 執行版 ZIP。
2. 完整解壓到本機固定資料夾。
3. 進入 win-unpacked 資料夾，執行 AV Presenter.exe。
4. 保留 exe 旁的所有檔案與資料夾，不要只複製 exe。
5. 若使用雙螢幕，在 Windows 顯示設定選「延伸這些顯示器」。
6. 從應用程式頂部語言選單選擇習慣的語言。

執行版不需要安裝 Node.js。0.2.0 尚未做程式碼簽章，請在下載說明中清楚標示「未簽章測試版」，不要稱為正式穩定版。

### 6.2 顯示第一個場景

1. 按 ADD MEDIA 匯入影片或圖片。
2. 在媒體清單選取檔案，確認它出現在 Preview。
3. 啟用文字疊加，輸入例如：

   NEXT SESSION
   10:00 Opening Ceremony

4. 啟用時鐘或倒數，調整字體大小、位置與背景。
5. 在底部選擇展示螢幕，按 START / MOVE OUTPUT。尚未 TAKE 時輸出維持原 Program；首次啟動通常是黑底。
6. 確認 Preview 後，按 TAKE → PROGRAM。
7. 展示螢幕顯示準備好的媒體及疊加內容。

### 6.3 更新文字與清除疊加

- 先在 Preview 修改文字，例如「LUNCH BREAK／PROGRAM RESUMES AT 13:30」。Program 保持原畫面。
- 按 TAKE 才更新展示螢幕。
- 按 CLEAR OVERLAYS，只隱藏文字／時鐘／倒數，背景媒體繼續播放。

### 6.4 操作倒數

1. 啟用 Countdown，輸入例如 10:00。
2. 按 SET PREVIEW DURATION。
3. 使用 Start Preview／Pause／Reset 準備倒數。
4. 按 TAKE 送到 Program。
5. 若要立即操作播出中的倒數，使用 START ON AIR／PAUSE ON AIR／RESET ON AIR。

必須說明：Program 的播放與倒數控制是即時操作；一般 Preview 編輯則須 TAKE。不要把所有按鈕都描述成只影響 Preview。

## 7. 每日展覽啟動設定

1. 將應用程式與媒體放在固定位置。
2. 準備好要展示的影片／圖片、文字、時鐘與倒數。
3. 設定播放與循環，按 TAKE 把正式展示內容送到 Program。
4. 選擇展示螢幕並啟動 Output。
5. 按「儲存目前設定」。
6. 勾選「下次啟動時還原目前狀態」。
7. 勾選「登入 Windows 後自動啟動」。
8. 正常關閉程式，重新登入或重新開機並登入 Windows，實際確認展示恢復。

補充：

- 尚未 TAKE 的 Preview 編輯仍只還原到 Preview，不會自動覆蓋 Program。
- 若保存時影片正在播放且輸出已開啟，恢復後會從影片開頭播放並重開輸出。
- 若保存時影片暫停或輸出關閉，不要期待啟動時自動變成播放／開啟；先保存需要的展示狀態。
- 倒數採「剩餘時間續跑」，不是指定每天的絕對結束時間，也不是每天自動重設到完整時長。
- 媒體保存的是路徑參照，不會打包或複製媒體；請勿移動、重新命名或刪除原檔案。
- 移動應用程式資料夾後，應從新位置取消並重新啟用登入自動啟動。
- 「每天電源開啟即展示」還取決於電腦開機與 Windows 登入流程；應用程式只處理登入後啟動及內容還原。

## 8. 目前限制與正確宣傳範圍

| 項目 | 0.2.0 的實際範圍 |
| --- | --- |
| 平台 | Windows x64；主要目標 Windows 11 |
| 輸出 | 一個 Program 輸出 |
| 疊加 | 一個多行文字、一個時鐘、一個倒數 |
| 畫布 | 1920 × 1080 邏輯畫布，等比例縮放；其他比例可能有黑邊 |
| 影片位置還原 | 從頭播放，不恢復精確播放位置 |
| 投影片 | 不支援 PowerPoint 原生播放、PDF 或 Google Slides |
| 專業影像輸出 | 不支援 NDI、DeckLink、SDI、Key/Fill 或 Genlock |
| 畫面切換 | 尚無淡入淡出、轉場或特效 |
| 同步 | 不提供專業影格同步或跨機同步 |
| 遠端控制 | 尚無 Web、OSC 或 Companion 操作 |
| 發布狀態 | 未簽章公開測試版，非已完成現場穩定性認證的正式版 |

GitHub Windows 編譯、封裝與 10 項自動測試已通過；實體雙螢幕、實際媒體播放與登入自動啟動仍需 Windows 實機驗證。不要宣稱已在所有展示設備上完成驗證。

公開原始碼不等於已授予特定開源授權。若尚未另行確認 LICENSE，不要自行標示 MIT、Apache 或可自由商用。

## 9. 建議資料欄位

可依入口網站現有資料模型調整命名；下列為內容參考，不要求採用特定框架或新增 API。

```json
{
  "id": "av-presenter",
  "name": "AV Presenter",
  "category": "AV / 展覽工具",
  "subtitle": "輕量現場播放與畫面疊加工具",
  "description": "播放影片與圖片，疊加時鐘、倒數及文字。先預覽、再 TAKE 到展示螢幕，也能保存設定並在登入 Windows 後自動恢復展示。",
  "platform": "Windows x64",
  "version": "0.2.0",
  "status": "public-testing",
  "tags": ["雙螢幕輸出", "Preview / Program", "時鐘與倒數", "設定還原"],
  "downloadUrl": "https://github.com/anm22884646/av-presenter/releases/download/v0.2.0/AV-Presenter-Windows-x64-0.2.0.zip",
  "releaseUrl": "https://github.com/anm22884646/av-presenter/releases/tag/v0.2.0",
  "repositoryUrl": "https://github.com/anm22884646/av-presenter",
  "guideUrl": "https://github.com/anm22884646/av-presenter/blob/main/WINDOWS-VALIDATION.md",
  "languages": ["en", "ja", "zh-Hant", "zh-Hans"]
}
```

## 10. 入口網站驗收清單

- 工具清單能找到 AV Presenter，名稱、平台、版本與公開測試版狀態正確。
- 字卡摘要清楚說明播放、疊加、預覽／播出與設定還原。
- Windows 下載按鈕導向指定的完整執行版 ZIP，未登入 GitHub 也能下載。
- Release 與 GitHub 專案連結能開啟。
- 指南說明完整解壓、win-unpacked、AV Presenter.exe，不要求一般使用者安裝 Node.js。
- 清楚區分 Preview 編輯、TAKE、CLEAR 及立即影響 Program 的操作。
- 自動啟動說明以 Windows 已登入為前提，沒有宣稱程式可自動開機或繞過登入。
- 介面語言、媒體格式、倒數恢復行為與功能限制符合本文件。
- 桌面與手機版字卡、指南與下載按鈕都能正常閱讀及操作。
- 更新版本時，同步更新文案、版本與下載檔名，不讓新版本標籤指向舊附件。
