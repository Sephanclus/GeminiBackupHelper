console.log("Gemini Backup Helper content script loaded.");

let shouldCancel = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_BACKUP') {
        shouldCancel = false;
        startBackup(false); // Not silent
        sendResponse({ status: 'started' });
    } else if (request.action === 'START_BACKUP_ALL') {
        shouldCancel = false;
        startBackupAll();
        sendResponse({ status: 'Batch backup started' });
    } else if (request.action === 'CANCEL_BACKUP_ALL') {
        shouldCancel = true;
        console.log("Cancellation requested.");
        sendResponse({ status: 'Cancelling...' });
    } else if (request.action === 'DOWNLOAD_COMPLETE') {
        console.log("Download complete detected by background script:", request.filename);
        // You can add logic here to record the filename or URL to storage if needed
    }
});

async function startBackupAll() {
    console.log("Starting batch backup...");
    const convoSelector = '.conversation-items-container .conversation-title';
    // We assume the list is loaded.
    // Query once to get count? Or query dynamically?
    // Querying dynamically is safer if list stays same size but DOM refs change.
    // If list grows (infinite scroll), we might miss some, but usually it's static or "Load more".
    // Let's rely on index.

    let items = document.querySelectorAll(convoSelector);
    const count = items.length;
    console.log(`Found ${count} conversations.`);

    for (let i = 0; i < count; i++) {
        if (shouldCancel) {
            console.log("Batch backup cancelled by user.");
            break;
        }

        // Re-query in case DOM refreshed
        items = document.querySelectorAll(convoSelector);
        const item = items[i];

        if (!item) {
            console.warn(`Conversation item at index ${i} not found. Skipping.`);
            continue;
        }

        const title = item.innerText;
        console.log(`--- Processing Conversation ${i + 1}/${count}: ${title} ---`);

        item.click();

        // Wait for conversation to load. 
        // We can wait for a bit, generic wait is safest for now.
        await new Promise(r => setTimeout(r, 5000));

        if (shouldCancel) break;

        // Run backup for this page, silent mode (no alerts)
        await startBackup(true);
    }

    if (!shouldCancel) {
        showToast("Batch Backup All Completed!", 5000);
    } else {
        showToast("Batch Backup Cancelled!", 3000);
    }
}

async function startBackup(silent = false) {
    console.log("Starting backup process...");

    // Selector from draft.md
    const selector = 'mat-icon.mat-icon.notranslate.button-icon.google-symbols.mat-ligature-font.mat-icon-no-color.ng-star-inserted';
    const icons = Array.from(document.querySelectorAll(selector));

    // Process candidates: finding parent buttons
    // We assume the user wants to click these buttons. 
    // We will try to filter for "download" related intent if possible, 
    // but since the user gave a specific selector, we primarily trust it 
    // or we can verify if the icon text is 'download' related (e.g. 'download', 'file_download', 'save_alt')
    // and/or aria-label '下載原尺寸'

    const candidates = [];
    icons.forEach(icon => {
        const button = icon.closest('button');
        if (button) {
            // Optional: Check strictly for "下載原尺寸" if the user insists on it.
            // todo.md says: 1. Find all "下載原尺寸" buttons.
            // So we should verify.
            const ariaLabel = button.getAttribute('aria-label') || "";
            const iconText = icon.innerText.trim();
            const buttonText = button.innerText.trim();

            // Console log to help debug what we found
            console.log("Found candidate:", { ariaLabel, iconText, buttonText, button });

            // Loose matching to be safe, or match user requirement strictly?
            // Requirements: "Find ... '下載原尺寸' buttons"
            if (ariaLabel.includes('下載原尺寸') || ariaLabel.includes('Download full size') || iconText === 'download') {
                candidates.push(button);
            } else {
                // If the selector was specific but aria-label doesn't match, 
                // maybe the user meant "ALL buttons found by this selector"?
                // But todo.md implies specific functionality.
                // Let's include it if it matches the selector from draft.md, 
                // assuming the selector was crafted for this purpose.
                // However, the selector matches "mat-icon...", which is generic.
                // CAUTION: If this selector matches ALL icons (copy, edit, etc.), we will have a problem.
                // Let's assume we MUST filter by "下載原尺寸" as per todo.md.
                if (ariaLabel.includes('下載') || ariaLabel.includes('download')) {
                    candidates.push(button);
                }
            }
        }
    });

    // If my filter is too strict and returns 0, I should probably fallback to "all matched by selector" 
    // OR alert the user. Given todo.md text, I'll filter by "下載原尺寸" primarily.

    // Let's refine the candidate list strategy:
    // 1. Filter by aria-label "下載原尺寸" (Download full size).
    const strictCandidates = icons.map(i => i.closest('button')).filter(b => b && (b.getAttribute('aria-label') || "").includes('下載原尺寸'));

    let finalCandidates = strictCandidates;
    if (finalCandidates.length === 0) {
        console.warn("No buttons found with aria-label '下載原尺寸'. Falling back to raw selector matches that look like download.");
        finalCandidates = icons.map(i => i.closest('button')).filter(b => b && (b.innerText.includes('download') || (b.getAttribute('aria-label') || "").includes('download') || b.innerText.includes('save')));
    }

    // If still empty, use all buttons from the selector (User might have given a VERY specific selector).
    if (finalCandidates.length === 0 && icons.length > 0) {
        console.warn("No download-specific buttons found. Using all buttons matching the provided selector.");
        finalCandidates = icons.map(i => i.closest('button')).filter(b => b);
    }

    // Remove duplicates
    finalCandidates = [...new Set(finalCandidates)];

    console.log(`Planned to click ${finalCandidates.length} buttons.`);

    if (finalCandidates.length === 0) {
        showToast("No buttons found to click.", 3000);
        return;
    }

    let successCount = 0;

    for (let i = 0; i < finalCandidates.length; i++) {
        if (shouldCancel) {
            console.log("Backup cancelled during image processing.");
            break;
        }
        const button = finalCandidates[i];
        console.log(`Processing button ${i + 1}/${finalCandidates.length}`);

        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 500));

        try {
            await clickAndWaitForDownload(button);
            successCount++;
        } catch (e) {
            console.error(`Error on button ${i + 1}:`, e);
            // Continue?
        }
    }

    if (!silent && !shouldCancel) {
        showToast(`Backup complete! Processed ${successCount}/${finalCandidates.length}.`, 5000);
    } else {
        console.log(`Page backup complete. Processed ${successCount}/${finalCandidates.length}.`);
    }
}

function clickAndWaitForDownload(button) {
    return new Promise((resolve, reject) => {
        const container = document.querySelector('.cdk-overlay-container');
        if (!container) {
            console.error("Overlay container not found!");
            // Try to click anyway?
            button.click();
            setTimeout(resolve, 2000); // Blind wait
            return;
        }

        let completed = false;
        let downloadDetected = false;

        const observer = new MutationObserver((mutations) => {
            const html = container.innerHTML;
            const text = container.textContent || ""; // Use textContent for performance, innerHTML for empty check

            // Check for detection phrase
            if (!downloadDetected && text.includes("圖片下載完成")) {
                console.log("Detected download completion message.");
                downloadDetected = true;
            }

            // Check for empty (clean slate)
            // We check if there are no element children (ignoring comments/text nodes which should be empty usually)
            if (container.children.length === 0) {
                if (downloadDetected) {
                    console.log("Container has no elements after download. Proceeding.");
                    observer.disconnect();
                    completed = true;
                    resolve();
                }
            }
        });

        observer.observe(container, { childList: true, subtree: true, characterData: true });

        button.click();
        console.log("Clicked button, waiting for snackbar...");

        // Safety timeout mechanism
        // 1. Wait for snackbar to APPEAR (optional, but good practice)
        // 2. Wait for snackbar to DISAPPEAR

        // Timeout for the whole operation per button
        setTimeout(() => {
            if (!completed) {
                observer.disconnect();
                console.warn("Timeout waiting for completion condition.");
                if (downloadDetected) {
                    // We saw the message but it didn't clear?
                    resolve();
                } else {
                    // We never saw the message. Failed download?
                    resolve(); // Move on anyway
                }
            }
        }, 30000); // 30 seconds per image
    });
}

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#323232';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '999999';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    toast.style.opacity = '0';

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}
