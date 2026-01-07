document.getElementById('startBtn').addEventListener('click', async () => {
  sendMessageToContentScript({ action: 'START_BACKUP' });
});

document.getElementById('startAllBtn').addEventListener('click', async () => {
  sendMessageToContentScript({ action: 'START_BACKUP_ALL' });
  document.getElementById('cancelAllBtn').disabled = false;
});

document.getElementById('cancelAllBtn').addEventListener('click', async () => {
  sendMessageToContentScript({ action: 'CANCEL_BACKUP_ALL' });
  document.getElementById('cancelAllBtn').disabled = true;
});

async function sendMessageToContentScript(message) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    document.getElementById('status').textContent = 'Processing...';

    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        document.getElementById('status').textContent = 'Error: ' + chrome.runtime.lastError.message;
      } else {
        document.getElementById('status').textContent = response && response.status ? response.status : 'Command sent.';
      }
    });
  }
}
