import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit, Lightbulb, MessageSquare, HelpCircle, Send, ChevronLeft } from 'lucide-react'
import { extractConfluenceContent } from '../../utils/confluence'
import { buildPrompt } from '../../utils/promptBuilder'

const menuItems = [
    { id: 'review', label: '초안 검토', icon: Search, color: 'bg-emerald-500', needsInput: false },
    { id: 'refine', label: '문서 교정', icon: Edit, color: 'bg-amber-500', needsInput: false },
    { id: 'plan', label: '기획하기', icon: Lightbulb, color: 'bg-violet-500', needsInput: true },
    { id: 'chat', label: '대화하기', icon: MessageSquare, color: 'bg-blue-500', needsInput: true },
    { id: 'feedback', label: '앱 사용법 및 피드백', icon: HelpCircle, color: 'bg-gray-500', needsInput: false, isLink: true },
]

const Menu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'main' | 'input'>('main')
    const [selectedItem, setSelectedItem] = useState<typeof menuItems[0] | null>(null)
    const [inputValue, setInputValue] = useState('')

    const handleAction = (item: typeof menuItems[0]) => {
        if (item.id === 'feedback') {
            window.open('https://goty-buttons.atlassian.net/wiki/spaces/~7120208902a67390fc4cc8b15ac8cbf456d337/pages/408126381/Untitled+live+doc+2026-02-05', '_blank');
            onClose();
            return;
        }

        if (item.needsInput) {
            setSelectedItem(item)
            setActiveTab('input')
            return
        }

        // NeedsInput이 false인 경우 (초안 검토, 문서 교정) - 기존대로 동작
        try {
            const markdown = extractConfluenceContent()
            const prompt = buildPrompt(item.id, markdown)

            sendToGemini(prompt, item.id)

            navigator.clipboard.writeText(markdown).catch(err => {
                console.warn('Failed to copy to clipboard:', err);
            });
        } catch (err) {
            console.error('Action failed:', err)
        }
    }

    const handleInputSubmit = () => {
        if (!selectedItem || !inputValue.trim()) return

        try {
            let context = inputValue;

            // '대화하기'의 경우에만 본문 내용 포함
            if (selectedItem.id === 'chat') {
                const markdown = extractConfluenceContent();
                context = `${markdown}\n\n[추가 요청사항]\n${inputValue}`;
            }

            // '기획하기'는 사용자 입력(inputValue)만 buildPrompt의 context로 전달됨

            const prompt = buildPrompt(selectedItem.id, context)
            sendToGemini(prompt, selectedItem.id)

            // 대화하기의 경우에만 클립보드 복사 (기획하기는 본문 불필요)
            if (selectedItem.id === 'chat') {
                try {
                    const markdown = extractConfluenceContent();
                    navigator.clipboard.writeText(markdown).catch(() => { });
                } catch (e) { }
            }

        } catch (err) {
            console.error('Action failed:', err)
        }
    }

    const sendToGemini = (prompt: string, itemId: string) => {
        try {
            console.log('Menu: Sending OPEN_GEMINI message to background for action:', itemId);
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

    const getGuideText = (id: string) => {
        if (id === 'plan') {
            return (
                <>
                    해결해야 할 문제나 달성하고 싶은 목표를 입력해주세요. <br />
                    <span className="italic text-gray-400 mt-1 block">
                        예시 : 아웃게임의 유효 PLC 를 90 일 이상 확보하고 싶은데 어떻게 하면 좋을까?
                    </span>
                </>
            );
        }
        if (id === 'chat') {
            return (
                <>
                    문서에 관해 대화하고 싶은 주제를 입력해주세요. <br />
                    <span className="italic text-gray-400 mt-1 block">
                        예시 : 문서의 안보다 더 좋은 안이 있을까? / 이게 최선일까? / 고려해야 할 사이드 이펙트가 있을까?
                    </span>
                </>
            );
        }
        return '내용을 입력해주세요.';
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
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                {selectedItem && getGuideText(selectedItem.id)}
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
