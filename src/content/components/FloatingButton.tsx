import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface FloatingButtonProps {
    isOpen: boolean
    onClick: () => void
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ isOpen, onClick }) => {
    const iconUrl = chrome.runtime.getURL('button-icon.png');

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // 컨플루언스 자체 이벤트 방해 금지
        console.log('FloatingButton: Clicked! isOpen was:', isOpen);
        onClick();
    }

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            style={{ pointerEvents: 'auto' }} // 버튼은 클릭 가능하게
            className={`
        w-20 h-20 rounded-full flex items-center justify-center
        bg-transparent cursor-pointer border-none p-0 outline-none
        transition-all duration-300
        ${isOpen ? 'bg-white/20' : ''}
      `}
        >
            {isOpen ? (
                <X size={40} className="text-gray-800 bg-white rounded-full p-2 shadow-lg" />
            ) : (
                <img
                    src={iconUrl}
                    alt="AI Assistant"
                    className="w-full h-full object-contain drop-shadow-2xl pointer-events-none"
                />
            )}
        </motion.button>
    )
}

export default FloatingButton
