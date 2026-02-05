import React from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Edit3, Lightbulb, PenTool } from 'lucide-react'
import { extractConfluenceContent } from '../../utils/confluence'
import { buildPrompt } from '../../utils/promptBuilder'

const menuItems = [
    { id: 'review', label: '초안 검토', icon: FileSearch, color: 'bg-emerald-500' },
    { id: 'refine', label: '문서 교정', icon: Edit3, color: 'bg-amber-500' },
    { id: 'plan', label: '기획 하기', icon: Lightbulb, color: 'bg-violet-500' },
    { id: 'prototype', label: '프로토타입 만들기', icon: PenTool, color: 'bg-rose-500' },
]

const Menu: React.FC = () => {
    const handleAction = async (id: string, label: string) => {
        console.log(`Executing: ${label}`)

        // 1. Extract context
        const markdown = extractConfluenceContent()

        // 2. Build prompt
        const prompt = buildPrompt(id, markdown)

        // 3. Copy to clipboard
        await navigator.clipboard.writeText(prompt)
        alert(`프롬프트가 클립보드에 복사되었습니다. 제미나이 창에 붙여넣어 주세요.\n\n[작업: ${label}]`)

        // 4. Open Gemini Side Panel
        chrome.runtime.sendMessage({ action: 'OPEN_GEMINI' })
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-2"
        >
            {menuItems.map((item, index) => (
                <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleAction(item.id, item.label)}
                    className="group flex items-center gap-3 bg-white/90 backdrop-blur-md border border-gray-200 px-4 py-3 rounded-2xl shadow-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                >
                    <div className={`${item.color} p-2 rounded-xl text-white shadow-sm`}>
                        <item.icon size={20} />
                    </div>
                    <span className="whitespace-nowrap">{item.label}</span>
                </motion.button>
            ))}
        </motion.div>
    )
}

export default Menu
