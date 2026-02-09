import React, { useState } from 'react'
import FloatingButton from './components/FloatingButton'
import Menu from './components/Menu'
import { AnimatePresence, motion } from 'framer-motion'

const App: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isLoaded, setIsLoaded] = useState(false)
    const constraintsRef = React.useRef(null)
    const isDragging = React.useRef(false)

    // Load saved position on mount
    React.useEffect(() => {
        chrome.storage.local.get(['widgetPosition'], (data) => {
            if (data.widgetPosition) {
                setPosition(data.widgetPosition)
            }
            setIsLoaded(true)
        })
    }, [])

    const toggleMenu = () => {
        // Only toggle if we weren't just dragging
        if (!isDragging.current) {
            setIsOpen(!isOpen);
        }
    }

    const handleDragStart = () => {
        isDragging.current = true
    }

    const handleDragEnd = (_: any, info: any) => {
        // Small timeout to ensure the click event doesn't fire immediately after drag
        setTimeout(() => {
            isDragging.current = false
        }, 100);

        // Save position
        const newPos = { x: position.x + info.offset.x, y: position.y + info.offset.y }
        setPosition(newPos)
        chrome.storage.local.set({ widgetPosition: newPos })
    }

    if (!isLoaded) return null

    return (
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none font-sans overflow-hidden">
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                dragElastic={0} // Stickier drag
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-64 top-40 pointer-events-auto flex flex-col items-end gap-4"
            >
                <FloatingButton isOpen={isOpen} onClick={toggleMenu} />
                <AnimatePresence>
                    {isOpen && (
                        <div key="menu-wrapper">
                            <Menu onClose={() => setIsOpen(false)} />
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

export default App
