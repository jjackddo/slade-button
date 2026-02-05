chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background: Received message', message.action);

    if (message.action === 'OPEN_GEMINI') {
        const windowId = sender.tab?.windowId;
        const tabId = sender.tab?.id;

        if (windowId !== undefined && tabId !== undefined) {
            console.log(`Background: Opening side panel. Window: ${windowId}, Tab: ${tabId}`);

            // 1. Store prompt data
            chrome.storage.local.set({
                pendingPrompt: message.prompt,
                pendingAction: message.id,
                lastUpdate: Date.now()
            }, async () => {
                try {
                    // 2. Open side panel
                    // Note: chrome.sidePanel.open is a user-gesture-protected API.
                    // Calling it from a message listener that originated from a click is usually OK.
                    await chrome.sidePanel.open({ tabId });

                    // 3. Ensure the panel points to our monitoring page
                    await chrome.sidePanel.setOptions({
                        tabId,
                        path: 'sidepanel.html',
                        enabled: true
                    });

                    console.log('Background: Side panel opened successfully');
                    sendResponse({ success: true });
                } catch (err) {
                    console.error('Background: Error opening side panel', err);
                    sendResponse({ success: false, error: String(err) });
                }
            });
        } else {
            console.error('Background: Missing windowId or tabId');
            sendResponse({ success: false, error: 'Missing context' });
        }
    }
    return true; // Keep message channel open for async response
});
