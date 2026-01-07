# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-06

### 🚀 New Features (新功能)
- **Auto Backup**: Add "Start Backup All" and "Cancel backup All" buttons.
  (增加"Start Backup All"按鈕，備份所有對話中的圖片；以及對應的"Cancel backup All"按鈕，中止備份所有對話的動作。)

## [1.0.0] - 2026-01-06

### 🚀 New Features (新功能)
- **Chrome Extension Release**: Launched the helper tool to automate image backups from Gemini chat history.
  (Chrome 擴充功能發布：推出輔助工具以自動化備份 Gemini 對話紀錄中的圖片。)
- **Sequential Downloading** (`content.js`): Automatically finds and clicks "Download full size" buttons one by one.
  (依序下載：自動尋找並逐一已擊「下載原尺寸」按鈕。)
- **Smart Verification**: Monitors the DOM for the "Image download complete" snackbar notification (`cdk-overlay-container`) to ensure successful downloads before proceeding.
  (智慧驗證：監控 DOM 中的「圖片下載完成」提示，確保下載成功後才繼續。)
- **Popup Interface**: Simple UI to start the backup process with a single click.
  (Popup 介面：簡單的介面，一鍵啟動備份流程。)

### 🔧 Improvements (改進)
- **Timeout Adjustment**: Increased the download wait timeout from 15 seconds to 30 seconds per image to handle larger files or unstable network conditions.
  (超時調整：將單張圖片的下載等待時間從 15 秒增加至 30 秒，以應對大檔案或網路不穩的狀況。)
- **Selector Precision**: refined logic to target specific Material Design icons specifically for downloading.
  (選擇器精確化：優化邏輯以精確鎖定下載專用的 Material Design 圖示。)
