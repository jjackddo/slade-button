console.log('Gemini Injector: Loaded on', window.location.href);

const injectPrompt = async () => {
    try {
        const data = await chrome.storage.local.get(['pendingPrompt', 'pendingAction']);
        if (!data.pendingPrompt) return;

        const { pendingPrompt: prompt, pendingAction: actionId } = data;
        console.log(`Gemini Injector: Found pending prompt for [${actionId}], injecting...`);

        // 입력창 찾기 및 데이터 주입 (최대 30초 폴링 - Gemini 로딩 시간 고려)
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds

        const findAndFill = setInterval(() => {
            attempts++;

            // 1. 입력창 찾기 (다양한 선택자 시도)
            // rich-textarea, contenteditable div, or generic role textbox
            const inputField = document.querySelector('.ql-editor') as HTMLElement ||
                document.querySelector('div[contenteditable="true"]') as HTMLElement ||
                document.querySelector('div[role="textbox"]') as HTMLElement ||
                document.querySelector('textarea') as HTMLElement;

            if (inputField) {
                console.log('Gemini Injector: Input field found!');
                clearInterval(findAndFill);

                // 약간의 딜레이 후 입력 (Focus 안정화)
                setTimeout(() => {
                    inputField.focus();
                    document.execCommand('selectAll', false);
                    document.execCommand('delete', false);

                    // 값을 직접 설정하는 것보다 execCommand 사용이 더 안정적일 수 있음
                    // 하지만 최신 브라우저에서는 execCommand insertText가 deprecated 될 수 있으므로
                    // innerText 설정 후 input 이벤트 발생 방식을 유지하되, 더 강력하게 처리

                    const p = inputField.querySelector('p');
                    if (p) {
                        p.innerText = prompt;
                    } else {
                        inputField.innerText = prompt;
                    }

                    // React/Angular 등의 바인딩을 깨우기 위한 이벤트 발송
                    inputField.dispatchEvent(new Event('input', { bubbles: true }));
                    inputField.dispatchEvent(new Event('change', { bubbles: true }));

                    // 엔터 키 이벤트 시뮬레이션 (선택적)
                    // const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter' });
                    // inputField.dispatchEvent(enterEvent);

                    // 전송 버튼 클릭 대기
                    let btnAttempts = 0;
                    const clickSend = setInterval(() => {
                        btnAttempts++;
                        // 전송 버튼 선택자 (아이콘, 아리아 라벨 등으로 찾기)
                        const sendButton = document.querySelector('button[aria-label*="Send"]') as HTMLElement ||
                            document.querySelector('button[aria-label*="보내기"]') as HTMLElement ||
                            document.querySelector('.send-button') as HTMLElement ||
                            document.querySelector('button > span.material-symbols-outlined:contains("send")')?.parentElement as HTMLElement; // 예시

                        // 버튼이 존재하고, disabled 상태가 아닐 때
                        if (sendButton && !sendButton.hasAttribute('disabled') && sendButton.getAttribute('aria-disabled') !== 'true') {
                            clearInterval(clickSend);
                            console.log('Gemini Injector: Send button found and clickable. Clicking...');
                            sendButton.click();

                            // 성공 후 데이터 삭제
                            chrome.storage.local.remove(['pendingPrompt', 'pendingAction']);
                        }

                        if (btnAttempts > 10) { // 5초 대기
                            clearInterval(clickSend);
                            console.warn('Gemini Injector: Send button not found or disabled.');
                        }
                    }, 500);

                }, 800);
            }

            if (attempts > maxAttempts) {
                clearInterval(findAndFill);
                console.log('Gemini Injector: Input field not found. Login might be required or UI changed.');
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
