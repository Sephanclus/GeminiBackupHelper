## Gemini 單頁原始圖片備份步驟

1. 尋找當前頁面上，所有「下載原尺寸」按鈕
尋找該按鈕可透過以下javascript
``` javascript
document.querySelectorAll('mat-icon.mat-icon.notranslate.button-icon.google-symbols.mat-ligature-font.mat-icon-no-color.ng-star-inserted');
```

2. 逐一點擊該按鈕，下載原尺寸圖片。點擊後，需先等待當前圖片下載完成，再點擊下一個按鈕。
3. 偵測到<div class="cdk-overlay-container"></div>中，
出現<div matsnackbarlabel="" class="mat-mdc-snack-bar-label mdc-snackbar__label">元件，且innerText包含「圖片下載完成」，則表示當前圖片下載完成。
4. 等到<div class="cdk-overlay-container">中的innerHTML變為空字串，表示當前圖片下載完成，可以點擊下一個「下載原尺寸」按鈕。

## Gemini 批量原始圖片備份步驟

1. 尋找所有對話的DOM元素

列出所有對話的DOM元素，可透過以下javascript
```javascript
document.querySelectorAll('.conversation-items-container  .conversation-title')
```
取得元素後，可以由innerText取得對話的標題。

2. 逐一點擊對話的DOM元素，進入對話頁面。

3. 執行單頁原始圖片備份步驟。

4. 執行單頁原始圖片備份步驟完成後，點擊下一個對話的DOM元素，進入下一個對話頁面。

5. 重複第2步至第4步，直到所有對話都備份完成。