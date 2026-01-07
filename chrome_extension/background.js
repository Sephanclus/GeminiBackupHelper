chrome.downloads.onChanged.addListener((delta) => {
    if (delta.state && delta.state.current === 'complete') {
        chrome.downloads.search({ id: delta.id }, (results) => {
            if (results && results.length > 0) {
                const item = results[0];
                console.log("Download completed. Filename:", item.filename);

                // Broadcast to active tabs
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'DOWNLOAD_COMPLETE',
                            filename: item.filename,
                            url: item.url,
                            downloadId: item.id
                        });
                    });
                });
            }
        });
    }
});
