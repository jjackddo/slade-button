import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.createElement('div')
root.id = 'confluence-gemini-root'

// Shadow DOM to isolate styles
const shadowRoot = root.attachShadow({ mode: 'open' })

// Inject Tailwind styles into Shadow DOM
const style = document.createElement('link')
style.rel = 'stylesheet'
style.href = chrome.runtime.getURL('src/content/index.css')
shadowRoot.appendChild(style)

const reactRoot = document.createElement('div')
shadowRoot.appendChild(reactRoot)
document.body.appendChild(root)

ReactDOM.createRoot(reactRoot).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
