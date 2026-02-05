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

                const proceedToType = () => {
                    // Focus and set content
                    setTimeout(() => {
                        inputField.focus();
                        const p = inputField.querySelector('p') || inputField;
                        p.innerText = prompt;

                        inputField.dispatchEvent(new Event('input', { bubbles: true }));

                        // Small delay before clicking send
                        setTimeout(() => {
                            const sendButton = document.querySelector('button[aria-label*="Send"], button[aria-label*="보내기"], .send-button-container button') as HTMLElement;
                            if (sendButton && !sendButton.hasAttribute('disabled')) {
                                sendButton.click();
                                console.log('Gemini Injector: Prompt injected and sent!');
                                chrome.storage.local.remove(['pendingPrompt', 'pendingAction']);
                            } else {
                                console.log('Gemini Injector: Send button not found or disabled. Please click manually.');
                                chrome.storage.local.remove(['pendingPrompt', 'pendingAction']);
                            }
                        }, 500);
                    }, 500);
                };

                // Per user request, we are moving towards solving tool selection via prompts.
                // Button UI automation is disabled to ensure prompt instructions take precedence.
                proceedToType();
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
