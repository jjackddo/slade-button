import React, { useState } from 'react'
import FloatingButton from './components/FloatingButton'
import Menu from './components/Menu'
import { AnimatePresence, motion } from 'framer-motion'

const App: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)
    const constraintsRef = React.useRef(null)

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div ref={constraintsRef} className="fixed inset-0 pointer-events-none font-sans overflow-hidden">
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragMomentum={false}
                dragElastic={0.1}
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
