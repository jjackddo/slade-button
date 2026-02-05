console.log('Gemini Injector: Content script loaded');

const injectPrompt = async () => {
    try {
        const data = await chrome.storage.local.get(['pendingPrompt', 'pendingAction']);
        if (!data.pendingPrompt) return;

        const { pendingPrompt: prompt, pendingAction: actionId } = data;
        console.log(`Gemini Injector: Found pending prompt for action [${actionId}], attempting injection...`);

        // Polling to find the input field
        const findAndFill = setInterval(() => {
            const inputField = document.querySelector('div[role="textbox"][contenteditable="true"]') as HTMLElement;

            if (inputField) {
                clearInterval(findAndFill);

                // --- Special Logic for Prototype (Select Canvas Tool) ---
                if (actionId === 'prototype') {
                    console.log('Gemini Injector: Attempting to select Canvas tool via menu...');

                    // 1. 먼저 메뉴를 여는 '추가' 또는 '도구' 버튼을 찾습니다.
                    const openMenuButton = document.querySelector('button[aria-label*="추가"], button[aria-label*="Add"], button[aria-label*="도구"]') as HTMLElement;

                    if (openMenuButton) {
                        openMenuButton.click();
                        console.log('Gemini Injector: Tools menu opened.');

                        // 2. 메뉴가 나타날 때까지 잠시 기다린 후 Canvas를 찾습니다.
                        setTimeout(() => {
                            const findCanvas = () => {
                                const elements = Array.from(document.querySelectorAll('div, span, button, [role="menuitem"]'));
                                return elements.find(el => {
                                    const text = (el.textContent || '').toLowerCase();
                                    return text === 'canvas' || text === '캔버스';
                                }) as HTMLElement;
                            };

                            const canvasItem = findCanvas();
                            if (canvasItem) {
                                canvasItem.click();
                                console.log('Gemini Injector: Canvas tool selected from menu.');
                            } else {
                                console.log('Gemini Injector: Canvas item not found in menu.');
                            }
                        }, 500);
                    } else {
                        console.log('Gemini Injector: Tool menu button not found.');
                    }
                }

                // Focus and set content (약간의 지연을 주어 도구 선택이 완료되도록 함)
                setTimeout(() => {
                    inputField.focus();
                    const p = inputField.querySelector('p') || inputField;
                    p.innerText = prompt;

                    inputField.dispatchEvent(new Event('input', { bubbles: true }));

                    // 마지막으로 전송 버튼 클릭
                    setTimeout(() => {
                        const sendButton = document.querySelector('button[aria-label*="Send"], button[aria-label*="보내기"], .send-button-container button') as HTMLElement;
                        if (sendButton && !sendButton.hasAttribute('disabled')) {
                            sendButton.click();
                            console.log('Gemini Injector: Prompt injected and sent!');
                            chrome.storage.local.remove(['pendingPrompt', 'pendingAction']);
                        } else {
                            chrome.storage.local.remove(['pendingPrompt', 'pendingAction']);
                        }
                    }, 500);
                }, actionId === 'prototype' ? 1000 : 0);
            }
        }, 1000);

        // Stop polling after 15 seconds to avoid infinite loop
        setTimeout(() => clearInterval(findAndFill), 15000);

    } catch (err) {
        console.error('Gemini Injector: Error during injection:', err);
    }
};

// Start the process
injectPrompt();
