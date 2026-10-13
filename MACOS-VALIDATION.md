# AV Presenter 0.4.0 — macOS 測試版

## 下載與安裝

- Apple Silicon（M 系列）：下載 `AV-Presenter-macOS-arm64-0.4.0.dmg`。
- Intel Mac：下載 `AV-Presenter-macOS-x64-0.4.0.dmg`。
- 系統需求：macOS 12 Monterey 或更新版本。建置與自動啟動驗證使用 macOS 15；較舊系統仍待實機確認。
- 開啟 DMG，將 **AV Presenter.app** 拖至 **Applications／應用程式**，退出 DMG，從應用程式資料夾啟動。
- ZIP 版本可解壓後將 app 移至應用程式資料夾。先安裝至固定位置，再啟用登入自動啟動。

測試版使用 ad-hoc 本機簽章，沒有 Apple Developer ID 與公證。首次開啟若遭 Gatekeeper 阻擋，可在嘗試開啟後前往「系統設定 → 隱私權與安全性」尋找「仍要打開」。較舊 macOS 也可嘗試 Finder 右鍵 → 打開。macOS 15 通常需要從系統設定允許。只對此可信下載進行個別允許，不需要停用整台 Mac 的安全檢查。受管理的 Mac 可能需要管理員允許。

## 操作

1. 連接外部螢幕並使用延伸桌面，啟動應用程式。
2. ADD MEDIA 選取 H.264 MP4、WebM、JPG／PNG。影片在 Preview 停於首影格。
3. 設定文字／時鐘／倒數。每種內容最多 8 個位置，X／Y 可輸入小數百分比。
4. 選擇輸出螢幕，按 START / MOVE OUTPUT，再按 TAKE；影片應開始播放，聲音由 Output 播放。
5. 只有一個螢幕時，Output 會使用視窗模式。

macOS 多螢幕輸出使用覆蓋整個目標螢幕的無邊框視窗，保持控制視窗可操作，不建立原生全螢幕 Space。請驗證 Mission Control、切換桌面、Dock／選單列與外接螢幕行為。

## 實機驗收

- 匯入影片或圖片，確認顯示與 codec 正常；Preview 與控制端 Program 靜音，Output 有聲音。
- Preview 暫停時 TAKE，確認 Output 開始播放；只改文字並 TAKE 不應重頭播放。
- 新增多個位置，改變文字、字體、顏色與小數座標；TAKE 前 Program 不變，TAKE 後同步。
- 測試 Preview／Program 的 Play、Pause、Restart、Loop；CLEAR 隱藏所有疊加，背景影片继续播放。
- 確認多位置時鐘與倒數一致；Program 倒數控制立即作用，其他編輯須 TAKE。
- 英文、日文、正體中文、簡體中文皆可操作；Command-C／V 等編輯快捷鍵可用。
- 雙螢幕模式確認 Output 覆蓋目標螢幕，控制端仍可操作；切換目標螢幕、拔插螢幕、Mission Control 與不同桌面。
- 測試 Retina／非 Retina 螢幕、不同縮放比例及 4K 输出；畫布為 1920×1080 邏輯座標，等比例縮放。
- 比較低負載選項關閉／開啟／控制端最小化三種情況；低負載模式只暫停控制端影片，外部影片、聲音、時鐘與倒數仍繼續。
- 準備展覽場景、TAKE、開啟 Output；儲存並勾選啟動還原。退出再啟動，確認媒體參照、Preview、Program、位置與輸出還原。
- 從 Applications 啟用「登入後自動啟動」，確認 macOS「一般 → 登入項目」有此 app；登出再登入驗證。亦確認取消勾選後不再自動啟動。
- 倒數從保存的剩餘時間繼續；影片從開頭載入。素材必須留在原路徑。

設定預設儲存在 `~/Library/Application Support/av-presenter/settings.json`。自動啟動需要登入 macOS；不修改自動登入或停電復電設定。App 關閉控制視窗即退出，亦可使用 Command-Q。

## 驗證範圍

GitHub macOS 原生建置會對兩種處理器封裝與驗證 ad-hoc 簽章，並執行 app 啟動、IPC、素材讀取、TAKE、多位置渲染、Output 與保存／重啟還原的自動煙霧測試。此測試使用 CI 虛擬顯示器，不能取代 Gatekeeper、登入自動啟動、實體多螢幕、4K 效能與影片音訊的實機驗證。

回報時請附 Mac 型號／晶片、macOS 版本、顯示器解析度／縮放、素材格式與重現步驟。
