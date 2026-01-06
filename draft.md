1. 尋找當前頁面上，所有「下載原尺寸」按鈕


尋找該按鈕可透過以下javascript
``` javascript
document.querySelectorAll('mat-icon.mat-icon.notranslate.button-icon.google-symbols.mat-ligature-font.mat-icon-no-color.ng-star-inserted');
```

2. 逐一點擊該按鈕，下載原尺寸圖片。點擊後，需先等待當前圖片下載完成，再點擊下一個按鈕。

下載前，HTML DOM中的<div class="cdk-overlay-container"></div>中的內容是空的；

下載中，HTML DOM中的<div class="cdk-overlay-container"></div>中的內容部分範例是
``` html 
<div class="cdk-overlay-container"><div class="cdk-global-overlay-wrapper" dir="ltr" style="justify-content: flex-start; align-items: flex-end;">
    <div id="cdk-overlay-22" class="cdk-overlay-pane" style="position: static; margin-left: 0px; margin-bottom: 0px;"><mat-snack-bar-container class="mdc-snackbar mat-mdc-snack-bar-container mat-snack-bar-container-enter mat-snack-bar-container-animations-enabled"><div class="mdc-snackbar__surface mat-mdc-snackbar-surface"><div class="mat-mdc-snack-bar-label"><div aria-live="off" id="mat-snack-bar-container-live-4"><div><extended-snackbar _nghost-ng-c939721112="" class="ng-star-inserted"><div _ngcontent-ng-c939721112="" class="snackbar-message"><div _ngcontent-ng-c939721112="" matsnackbarlabel="" class="mat-mdc-snack-bar-label mdc-snackbar__label label">正在下載原尺寸圖片...</div><div _ngcontent-ng-c939721112="" class="actions"><!----><!----><!----><button _ngcontent-ng-c939721112="" mat-icon-button="" aria-label="關閉" class="mdc-icon-button mat-mdc-icon-button mat-mdc-button-base close-button mat-unthemed ng-star-inserted" mat-ripple-loader-uninitialized="" mat-ripple-loader-class-name="mat-mdc-button-ripple" mat-ripple-loader-centered=""><span class="mat-mdc-button-persistent-ripple mdc-icon-button__ripple"></span><mat-icon _ngcontent-ng-c939721112="" role="img" fonticon="close" class="mat-icon notranslate close-icon google-symbols mat-ligature-font mat-icon-no-color" aria-hidden="true" data-mat-icon-type="font" data-mat-icon-name="close"></mat-icon><span class="mat-focus-indicator"></span><span class="mat-mdc-button-touch-target"></span></button><!----></div></div></extended-snackbar><!----></div></div></div></div></mat-snack-bar-container></div>
</div></div>
```

下載完成那一刻，HTML DOM中的<div class="cdk-overlay-container"></div>中的內容部分範例是
``` html 
<div id="cdk-overlay-21" class="cdk-overlay-pane" style="position: static; margin-left: 0px; margin-bottom: 0px;"><mat-snack-bar-container class="mdc-snackbar mat-mdc-snack-bar-container custom-snackbar mat-snack-bar-container-animations-enabled mat-snack-bar-container-enter"><div class="mdc-snackbar__surface mat-mdc-snackbar-surface"><div class="mat-mdc-snack-bar-label"><div aria-live="off" id="mat-snack-bar-container-live-3"><div><simple-snack-bar class="mat-mdc-simple-snack-bar ng-star-inserted"><div matsnackbarlabel="" class="mat-mdc-snack-bar-label mdc-snackbar__label"> 圖片下載完成
</div><!----></simple-snack-bar><!----></div></div></div></div></mat-snack-bar-container></div>
```


監視範例
```javascript
// 目標容器類別與標籤類別
const CONTAINER_SELECTOR = '.cdk-overlay-container';
const LABEL_CLASS = 'mat-mdc-snack-bar-label';

// 建立觀察器邏輯
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    // 檢查是否有新加入的節點
    mutation.addedNodes.forEach((node) => {
      // 確保是元素節點 (NodeType 1)
      if (node.nodeType === 1) {
        // 情況 A: 節點本身就是目標標籤
        // 情況 B: 目標標籤被包裹在剛加入的節點內
        const labelNode = node.classList.contains(LABEL_CLASS) 
                          ? node 
                          : node.querySelector(`.${LABEL_CLASS.split(' ').join('.')}`);

        if (labelNode) {
          console.log('偵測到通知內容:', labelNode.innerText.trim());
          
          // 可以在這裡執行你的邏輯，例如紀錄到 Chrome Storage
          handleToastMessage(labelNode.innerText.trim());
        }
      }
    });
  }
});

// 開始監聽的功能函數
function startObserving() {
  const container = document.querySelector(CONTAINER_SELECTOR);
  
  if (container) {
    observer.observe(container, {
      childList: true, // 監聽子節點的新增與刪除
      subtree: true    // 進行深度監聽（因為 label 可能在多層 div 之下）
    });
    console.log('已開始監視 Snackbar 變化...');
  } else {
    // 如果連容器都還沒產生（例如頁面剛載入），可以改監聽 body 或等待容器出現
    console.warn('找不到容器，嘗試監聽 body 以捕捉容器生成...');
    new MutationObserver((m, obs) => {
      if (document.querySelector(CONTAINER_SELECTOR)) {
        startObserving();
        obs.disconnect(); // 找到後停止監聽 body
      }
    }).observe(document.body, { childList: true });
  }
}

// 啟動
startObserving();

// 處理訊息的自定義函式
function handleToastMessage(text) {
  // 範例：過濾出與下載相關的訊息
  if (text.includes('下載') || text.includes('儲存')) {
    //chrome.runtime.sendMessage({ action: "LOG_TOAST", data: text });
    console.log('偵測到通知內容:', text);
  }
}

```

左側對話列表參考

```javascript
document.querySelectorAll('.conversation-items-container  .conversation-title')
```

```html
<div _ngcontent-ng-c4037767657="" class="conversation-items-container ng-tns-c4037767657-152 ng-star-inserted side-nav-opened"><!----><div _ngcontent-ng-c4037767657="" matripple="" tabindex="0" data-test-id="conversation" mattooltipposition="right" mattooltipshowdelay="300" class="mat-ripple mat-mdc-tooltip-trigger conversation ng-tns-c4037767657-152 ng-trigger ng-trigger-conversationListRevealAnimation selected" role="button" jslog="186014;track:generic_click;BardVeMetadataKey:[null,null,null,null,null,null,null,[&quot;c_e7645f02c94363a7&quot;,null,0,1]];mutable:true" aria-describedby="cdk-describedby-message-ng-1-333" cdk-describedby-host="ng-1"><div _ngcontent-ng-c4037767657="" autotextdirection="" class="conversation-title gds-label-l ng-tns-c4037767657-152" dir="ltr"><!----> 請參考這張圖片，為該角色設計一張服裝分解圖。要求：

1. 使用純白背景。
2. 只需要畫服裝與配件，不需要畫人物角色本身。
3. 包含服裝的正面全身視圖。
4. 旁邊需將外衣、內搭、配飾（如腰帶、徽章）單獨拆解出來展示。
5. 線條清晰，顏色與原圖保持高度一致。
6. 像時尚雜誌那樣把衣服一件件拆開來放 <div _ngcontent-ng-c4037767657="" class="conversation-title-cover ng-tns-c4037767657-152"></div></div><div _ngcontent-ng-c4037767657="" class="pin-icon-container with-mat-icon ng-tns-c4037767657-152"><!----><!----></div></div><!----><!----></div>
```