chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'OPEN_GEMINI') {
        chrome.sidePanel.setOptions({
            path: 'sidepanel.html',
            enabled: true
        });
        // Open the side panel
        if (sender.tab && sender.tab.windowId !== undefined) {
            chrome.sidePanel.open({ windowId: sender.tab.windowId });
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: 'No tab or window ID found' });
        }
    }
});
