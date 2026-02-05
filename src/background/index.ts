chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'OPEN_GEMINI') {
        const windowId = sender.tab?.windowId;
        if (windowId !== undefined) {
            // 프롬프트를 로컬 스토리지에 임시 저장하여 제미나이 페이지에서 가져갈 수 있게 합니다.
            chrome.storage.local.set({
                pendingPrompt: message.prompt,
                pendingAction: message.id
            }, () => {
                chrome.sidePanel.setOptions({
                    path: 'https://gemini.google.com/app',
                    enabled: true
                });
                chrome.sidePanel.open({ windowId });
                sendResponse({ success: true });
            });
        } else {
            sendResponse({ success: false, error: 'No tab or window ID found' });
        }
    }
    return true;
});
