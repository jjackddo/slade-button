import React, { useState } from 'react'
import FloatingButton from './components/FloatingButton'
import Menu from './components/Menu'
import { AnimatePresence } from 'framer-motion'

const App: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        console.log('App: Toggling menu. Current state:', isOpen);
        setIsOpen(!isOpen);
    }

    return (
        <div className="mt-40 mr-64 flex flex-col items-end gap-4 font-sans pointer-events-auto">
            <FloatingButton isOpen={isOpen} onClick={toggleMenu} />
            <AnimatePresence>
                {isOpen && (
                    <div key="menu-wrapper">
                        <Menu onClose={() => setIsOpen(false)} />
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default App
