chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background: Received message', message.action);

    if (message.action === 'OPEN_GEMINI') {
        const tabId = sender.tab?.id;

        if (tabId !== undefined) {
            console.log(`Background: Opening side panel for Tab: ${tabId}`);

            // 1. IMMEDIATELY call open to preserve user gesture
            // This MUST be the first thing called in the task to work reliably
            chrome.sidePanel.open({ tabId }).catch(err => {
                console.error('Background: sidePanel.open failed', err);
            });

            // 2. Set options and store data
            // These don't require user gesture, so they can happen in any order
            chrome.sidePanel.setOptions({
                tabId,
                path: 'sidepanel.html',
                enabled: true
            }).then(() => {
                return chrome.storage.local.set({
                    pendingPrompt: message.prompt,
                    pendingAction: message.id,
                    lastUpdate: Date.now()
                });
            }).then(() => {
                console.log('Background: Side panel options and storage updated');
                sendResponse({ success: true });
            }).catch(err => {
                console.error('Background: Error updating side panel state', err);
                sendResponse({ success: false, error: String(err) });
            });
        } else {
            console.error('Background: Missing tabId');
            sendResponse({ success: false, error: 'Missing context' });
        }
    }
    return true; // Keep channel open
});
