console.log('Gemini Injector: Loaded on', window.location.href);

const injectPrompt = async () => {
    try {
        const data = await chrome.storage.local.get(['pendingPrompt', 'pendingAction']);
        if (!data.pendingPrompt) return;

        const { pendingPrompt: prompt, pendingAction: actionId } = data;
        console.log(`Gemini Injector: Found pending prompt for [${actionId}], injecting...`);

        // 입력창 찾기 및 데이터 주입 (최대 15초 폴링)
        let attempts = 0;
        const findAndFill = setInterval(() => {
            const inputField = document.querySelector('div[role="textbox"][contenteditable="true"]') as HTMLElement;
            attempts++;

            if (inputField) {
                clearInterval(findAndFill);

                setTimeout(() => {
                    inputField.focus();
                    const p = inputField.querySelector('p') || inputField;
                    p.innerText = prompt;

                    inputField.dispatchEvent(new Event('input', { bubbles: true }));

                    // 전송 버튼 클릭
                    setTimeout(() => {
                        const sendButton = document.querySelector('button[aria-label*="Send"], button[aria-label*="보내기"], .send-button-container button') as HTMLElement;
                        if (sendButton && !sendButton.hasAttribute('disabled')) {
                            sendButton.click();
                            console.log('Gemini Injector: Prompt injected and sent!');
                            // 성공 후 데이터 삭제 (중복 입력 방지)
                            chrome.storage.local.remove(['pendingPrompt', 'pendingAction']);
                        }
                    }, 800);
                }, 500);
            }

            if (attempts > 15) {
                clearInterval(findAndFill);
                console.log('Gemini Injector: Input field not found. Login might be required.');
            }
        }, 1000);

    } catch (err) {
        console.error('Gemini Injector: Error during injection:', err);
    }
};

// 1. 페이지 로드 시 즉시 주입 시도
injectPrompt();

// 2. 이미 제미나이가 열린 상태에서 새로운 버튼 클릭 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.lastUpdate) {
        console.log('Gemini Injector: New action detected, reloading for new chat...');
        // 새로운 액션이 들어오면 페이지를 새로고침하여 injectPrompt가 다시 실행되도록 함
        // URL에 타임스탬프를 찍어 강제 새로고침 유도
        window.location.href = "https://gemini.google.com/app?newchat=" + Date.now();
    }
});
