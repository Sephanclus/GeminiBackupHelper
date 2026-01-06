document.getElementById('startBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      document.getElementById('status').textContent = 'Starting...';
      document.getElementById('startBtn').disabled = true;
      
      chrome.tabs.sendMessage(tab.id, { action: 'START_BACKUP' }, (response) => {
        if (chrome.runtime.lastError) {
             document.getElementById('status').textContent = 'Error: ' + chrome.runtime.lastError.message;
             document.getElementById('startBtn').disabled = false;
        } else {
             document.getElementById('status').textContent = 'Process started. Check console.';
        }
      });
    }
  });
