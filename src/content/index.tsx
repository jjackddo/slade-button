import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Confluence Gemini Assistant: Content script starting...');

let rootInstance: ReactDOM.Root | null = null;
let observer: MutationObserver | null = null;

const init = () => {
    // 1. 임시로 옵저버 중지 (무한 루프 방지)
    if (observer) {
        observer.disconnect();
    }

    // 2. 기존 루트가 있다면 제거
    const existingRoot = document.getElementById('confluence-gemini-root');
    if (existingRoot) {
        existingRoot.remove();
    }

    const root = document.createElement('div')
    root.id = 'confluence-gemini-root'

    // 스타일 강제 적용
    Object.assign(root.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '2147483647',
        pointerEvents: 'none',
        margin: '0',
        padding: '0'
    });

    document.body.appendChild(root);

    rootInstance = ReactDOM.createRoot(root);
    rootInstance.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

    console.log('Confluence Gemini Assistant: Initialized successfully');

    // 3. 옵저버 재시작
    if (observer) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

// 초기 로드
if (document.readyState === 'complete') {
    setTimeout(init, 500); // 페이지 완전 로드 후 약간의 여유
} else {
    window.addEventListener('load', init);
}

// 컨플루언서 페이지 이동 감지 (SPA 및 불시 삭제 대응)
let lastUrl = location.href;
observer = new MutationObserver(() => {
    if (lastUrl !== location.href) {
        lastUrl = location.href;
        console.log('Confluence Gemini Assistant: URL changed, re-initializing...');
        setTimeout(init, 1000);
        return;
    }

    // 루트 요소가 사라진 경우만 다시 생성 (내부 변화는 무시)
    if (!document.getElementById('confluence-gemini-root')) {
        console.log('Confluence Gemini Assistant: Root missing, re-initializing...');
        init();
    }
});

observer.observe(document.body, { childList: true, subtree: false }); // subtree: false로 본문 상위 노드 변화만 감지
