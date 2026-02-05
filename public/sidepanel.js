// 새로운 액션 발생 시 프레임을 새로고침하여 주입 스크립트를 재실행시킵니다.
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.pendingPrompt || changes.lastUpdate)) {
        console.log('SidePanel: New action detected, reloading Gemini frame...');
        const frame = document.getElementById('gemini-frame');
        if (frame) {
            frame.src = "https://gemini.google.com/app?refresh=" + Date.now();
        }
    }
});

console.log('SidePanel: Monitor script loaded and active');
