import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Confluence Gemini Assistant: Content script starting...');

let rootInstance: ReactDOM.Root | null = null;

const init = () => {
    // 기존 루트가 있다면 제거하여 깨끗한 상태로 유지
    const existingRoot = document.getElementById('confluence-gemini-root');
    if (existingRoot) {
        console.log('Confluence Gemini Assistant: Cleaning up existing root before re-init');
        existingRoot.remove();
    }

    const root = document.createElement('div')
    root.id = 'confluence-gemini-root'

    // 스타일 강제 적용
    Object.assign(root.style, {
        position: 'fixed !important',
        top: '0 !important',
        right: '0 !important',
        width: 'auto !important',
        height: 'auto !important',
        zIndex: '2147483647 !important',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end'
    });

    // 실제 스타일은 CSS 클래스로 처리하되 초기 위치만 고정
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.right = '0';
    root.style.zIndex = '2147483647';

    document.body.appendChild(root);

    rootInstance = ReactDOM.createRoot(root);
    rootInstance.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

    console.log('Confluence Gemini Assistant: Re-rendered successfully');
}

// 초기 실행
if (document.readyState === 'complete') {
    init();
} else {
    window.addEventListener('load', init);
}

// 컨플루언서 페이지 이동 감지 (SPA 대응)
let lastUrl = location.href;
const observer = new MutationObserver(() => {
    if (lastUrl !== location.href) {
        lastUrl = location.href;
        console.log('Confluence Gemini Assistant: URL changed, re-initializing...');
        setTimeout(init, 1000); // 페이지 로드 시간을 위해 약간 지연
    }

    // 버튼이 강제로 삭제된 경우 대응
    if (!document.getElementById('confluence-gemini-root')) {
        init();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
