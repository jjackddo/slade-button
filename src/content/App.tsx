import React, { useState } from 'react'
import FloatingButton from './components/FloatingButton'
import Menu from './components/Menu'
import { AnimatePresence } from 'framer-motion'

const App: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-8 right-8 z-[2147483647] flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && <Menu />}
            </AnimatePresence>
            <FloatingButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </div>
    )
}

export default App
