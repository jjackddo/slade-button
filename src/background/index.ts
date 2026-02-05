chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background: Received message', message.action);

    if (message.action === 'OPEN_GEMINI') {
        const tabId = sender.tab?.id;

        if (tabId !== undefined) {
            console.log(`Background: Opening side panel for Tab: ${tabId}`);

            // 1. Open side panel (Requires User Gesture)
            chrome.sidePanel.open({ tabId }).catch(err => {
                console.error('Background: sidePanel.open failed', err);
            });

            // 3. Store data (Optimistic update)
            chrome.storage.local.set({
                pendingPrompt: message.prompt,
                pendingAction: message.id,
                lastUpdate: Date.now()
            }).then(() => {
                console.log('Background: Storage updated');
                sendResponse({ success: true });
            }).catch(err => {
                console.error('Background: Error updating storage', err);
                sendResponse({ success: false, error: String(err) });
            });
        } else {
            console.error('Background: Missing tabId');
            sendResponse({ success: false, error: 'Missing context' });
        }
    }
    return true; // Keep channel open
});

// 3. Close Side Panel on Navigation
// Disabled to prevent "Side Panel Not Opening" bug.
// chrome.tabs.onUpdated.addListener(...) removed.

// Optionally, handle tab switching
chrome.tabs.onActivated.addListener((activeInfo) => {
    // When switching tabs, we might want to ensure the panel logic is clean.
    // Side panels are per-tab if setOptions is used with tabId.
    // So usually Chrome handles visibility (hides panel of Tab A when showing Tab B).
    // so explicit closing might not be needed for simple tab switching.
    // But the user asked: "다른 탭으로 이동하거나" -> This usually implies "When I leave this tab".
    // Chrome handles this automatically (Side Panel is associated with the tab).
    // The issue is if "Page is moved" (Navigation). 
    // The onUpdated logic above handles navigation within the tab.
});
