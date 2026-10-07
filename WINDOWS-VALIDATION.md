# AV Presenter 0.2.1 — Windows 驗證版

## 啟動

1. 完整解壓 AV-Presenter-Windows-x64-0.2.1.zip 至本機資料夾。
2. 保留 exe 旁所有資料夾與檔案，雙擊 `AV Presenter.exe`。
3. Windows 11 x64 為主要測試目標。本版本未做程式碼簽章。
4. 以 Windows「延伸」桌面模式連接第二螢幕。

## 驗收步驟

- 控制視窗應出現在主螢幕；底部列出所有螢幕及解析度。
- 選擇第二螢幕，按 START / MOVE OUTPUT；確認乾淨全螢幕黑底，無選單、標題列、邊框。
- ADD MEDIA 匯入 H.264 MP4、JPG、PNG（亦支援 WebM）。選取媒體只更新 Preview，影片預設停在第一個影格。
- 勾選 TEXT Enabled，輸入兩行文字；啟用 CLOCK，調整位置／樣式。
- 按 TAKE，確認輸出包含背景和疊加。Preview 與控制端 Program 小畫面皆靜音，音訊由 Output 播放。
- 編輯 Preview 文字，確認輸出維持原文字；再次 TAKE 才更新。
- 影片播放途中按 CLEAR OVERLAYS，確認只清除文字／時鐘／倒數，影片不中斷。
- 左側播放控制只操作 Preview；右側 Program 播放控制即時操作輸出。檢查 Play、Pause、Restart、Loop。
- 倒數輸入 00:30，按 SET PREVIEW DURATION，再按 Start Preview、TAKE；確認倒數更新且不受影片暫停影響。
- Program countdown 的 START / PAUSE / RESET ON AIR 立即操作輸出；其他倒數編輯仍須 TAKE。
- 倒數运行中只編輯文字並 TAKE，確認倒數不重設。
- 切換輸出螢幕並按 START / MOVE OUTPUT，確認應用程式不重啟。
- 拔除輸出螢幕，確認控制端顯示 disconnected；重新插入後選擇並重新啟動輸出。
- STOP OUTPUT 後再次啟動，確認目前 Program 回復。
- 單螢幕時應顯示提示並開啟視窗模式輸出，可用 STOP OUTPUT 關閉。
- 匯入影片後移動／刪除原始檔，再 TAKE，確認顯示錯誤且原 Program 保留。

## 已在開發環境確認

- TypeScript 編譯與 renderer bundle。
- 狀態測試涵蓋 Preview / Program 分離、TAKE 深層複製、CLEAR 保留媒體、倒數暫停／恢復、無關 TAKE 保留倒數，以及 IPC 資料驗證。
- Windows x64 應用程式封裝。

## 尚待 Windows 實機確認

- 實體雙螢幕 fullscreen、DPI 混合比例與熱插拔。
- MP4 音訊／影像、codec、影片結尾與 looping。
- 此環境未成功啟動 Electron 圖形介面，所以封裝成功不代表 Windows 執行驗證已完成。

## MVP 範圍與限制

- 圖像／影片以 1920×1080 邏輯畫布等比例置中，其他比例螢幕可能有黑邊。
- 不支援 PowerPoint 原生播放、NDI、DeckLink、轉場或專業影格同步。
- 儲存設定可保留媒體清單、Preview、Program 與樣式；啟用還原後自動儲存。媒體檔案不複製到 app。
- Program 的媒體不可直接移除；先 TAKE 其他媒體或 BLACK BACKGROUND。
- 輸出關閉／重新開啟時影片會重新載入，倒數依原截止時間繼續。
- 輸出為黑底與內容，不顯示錯誤訊息；錯誤只出現在控制端。

回報問題時請提供：操作步驟、預期／實際行為、Windows 版本、螢幕解析度與縮放比例、媒體格式；若有錯誤請附控制端文字。

## 0.2.1 語言與展覽自動啟動驗收

1. 依序切換 English、日本語、正體中文、简体中文。按鈕、欄位、對齊選單、輸出狀態應即時更新；文字輸入、字體大小、位置與 Program 不變。
2. 準備展覽內容，按 TAKE，開啟目標輸出；設定 Clock / Countdown 的字體、位置、背景。
3. 按「儲存目前設定」，勾選「下次啟動時還原目前狀態」。改動任一位置／大小並正常關閉。
4. 重開，確認 Preview 與 Program 各自還原，媒體／循環／播放狀態保留，原本開啟的輸出自動開啟。
5. 執行倒數後關閉，等待一段時間再開啟；應從關閉時剩餘時間繼續，不扣除關機時間。影片從開頭載入。
6. 未按 TAKE 的 Preview 改動仍只還原至 Preview，不自動蓋掉 Program。
7. 啟用「登入 Windows 後自動啟動」，登出再登入，或正常重新開機並登入；驗證 app 與輸出自動啟動。
8. 展示螢幕斷線時重新啟動，應等待展示螢幕；重新插入後自動恢復。不要自動將第二螢幕輸出轉移到控制主螢幕。
9. 取消自動還原，重啟後應是新的黑底場景；取消登入自動啟動，重新登入後不啟動。

請先把應用程式放在固定資料夾再啟用登入自動啟動。若移動資料夾，從新位置取消並重新勾選登入自動啟動。自動啟動以 Windows 已登入為前提；不會修改 BIOS 斷電復電設定或 Windows 自動登入設定。

## 0.2.1 Preview 首影格驗收

- 匯入影片後，確認 Preview 顯示第一個影格且不自動播放。
- 選取另一支影片，確認同樣暫停在第一個影格。
- 先播放 Preview，再重新選取同一支影片，確認回到第一個影格並暫停。
- 準備時只改 Preview，確認目前 Program 仍維持原播放狀態。
- Preview 暫停時 TAKE，確認 Program 顯示首影格；按 Program Play 後播放。
- Preview 先按 Play 再 TAKE，確認 Program 依準備的播放狀態播放。
- 已儲存的展覽播放狀態仍照原設定還原，不因新素材預設暫停而改動。
