import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit, Lightbulb, PenTool, Send, ChevronLeft, MessageSquare } from 'lucide-react'
import { extractConfluenceContent } from '../../utils/confluence'
import { buildPrompt } from '../../utils/promptBuilder'

const menuItems = [
    { id: 'review', label: '초안 검토', icon: Search, color: 'bg-emerald-500' },
    { id: 'refine', label: '문서 교정', icon: Edit, color: 'bg-amber-500' },
    { id: 'plan', label: '기획 하기', icon: Lightbulb, color: 'bg-violet-500', needsInput: true },
    { id: 'chat', label: '대화 하기', icon: MessageSquare, color: 'bg-blue-500' },
]

const Menu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'main' | 'input'>('main')
    const [selectedItem, setSelectedItem] = useState<typeof menuItems[0] | null>(null)
    const [inputValue, setInputValue] = useState('')

    const handleAction = async (item: typeof menuItems[0]) => {
        if (item.needsInput) {
            setSelectedItem(item)
            setActiveTab('input')
            return
        }

        try {
            const markdown = extractConfluenceContent()
            // Copy to clipboard as requested
            try {
                await navigator.clipboard.writeText(markdown);
                console.log('Content copied to clipboard');
            } catch (copyErr) {
                console.warn('Failed to copy to clipboard:', copyErr);
            }

            const prompt = buildPrompt(item.id, markdown)
            sendToGemini(prompt, item.id)
        } catch (err) {
            console.error('Action failed:', err)
        }
    }

    const handleInputSubmit = () => {
        if (!selectedItem || !inputValue.trim()) return

        const prompt = buildPrompt(selectedItem.id, inputValue)
        sendToGemini(prompt, selectedItem.id)
    }

    const sendToGemini = (prompt: string, itemId: string) => {
        try {
            console.log('Menu: Sending OPEN_GEMINI message to background for action:', itemId);
            // 3. Open Gemini Side Panel with prompt
            chrome.runtime.sendMessage({ action: 'OPEN_GEMINI', prompt, id: itemId })
        } catch (e: any) {
            if (e.message.includes('context invalidated')) {
                alert('익스텐션이 업데이트되었습니다. 페이지를 새로고침하여 적용해 주세요!');
            } else {
                console.error(e)
            }
        }
        onClose()
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="flex flex-col gap-3 mt-2 w-80"
        >
            <AnimatePresence mode="wait">
                {activeTab === 'main' ? (
                    <motion.div
                        key="main-menu"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-3"
                    >
                        {menuItems.map((item, index) => (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleAction(item)}
                                className="group flex items-center gap-3 bg-white/95 backdrop-blur-md border border-gray-200 px-4 py-3 rounded-2xl shadow-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                            >
                                <div className={`${item.color} p-2 rounded-xl text-white shadow-sm`}>
                                    <item.icon size={20} />
                                </div>
                                <span className="whitespace-nowrap">{item.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="input-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white/95 backdrop-blur-md border border-gray-200 p-4 rounded-3xl shadow-2xl flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <button onClick={() => setActiveTab('main')} className="hover:text-gray-800 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-semibold">{selectedItem?.label}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                                가이드: 해결해야 할 문제나 달성하고 싶은 목표를 입력해주세요.
                            </label>
                            <textarea
                                autoFocus
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="여기에 입력하세요..."
                                className="w-full h-32 p-3 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-none text-sm text-gray-700"
                            />
                        </div>

                        <button
                            onClick={handleInputSubmit}
                            disabled={!inputValue.trim()}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 transition-all group"
                        >
                            <span>회장님께 보고하기</span>
                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Menu
