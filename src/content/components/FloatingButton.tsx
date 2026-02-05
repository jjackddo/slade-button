import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'

interface FloatingButtonProps {
    isOpen: boolean
    onClick: () => void
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ isOpen, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className={`
        w-16 h-16 rounded-full flex items-center justify-center
        bg-gradient-to-tr from-blue-600 to-indigo-600
        text-white shadow-lg shadow-blue-500/30
        transition-colors duration-300
        ${isOpen ? 'from-rose-500 to-red-500' : ''}
      `}
        >
            {isOpen ? <X size={32} /> : <Sparkles size={32} />}
        </motion.button>
    )
}

export default FloatingButton
