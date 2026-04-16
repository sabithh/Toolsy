'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme, isLight } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.85 }}
            title={isLight ? 'Switch to brand mode' : 'Switch to light mode'}
            aria-label={isLight ? 'Switch to brand mode' : 'Switch to light mode'}
            style={{
                position: 'relative',
                width: 56,
                height: 28,
                borderRadius: 14,
                border: isLight ? '1px solid #D8D8D8' : '1px solid rgba(0,0,0,0.4)',
                background: isLight ? '#EBEBEB' : 'rgba(0,0,0,0.5)',
                padding: 3,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                outline: 'none',
                flexShrink: 0,
                overflow: 'hidden',
                transition: 'background 0.4s ease, border-color 0.4s ease',
            }}
        >
            {/* Flash ripple on toggle */}
            <AnimatePresence mode="wait">
                <motion.span
                    key={theme}
                    initial={{ opacity: 0.6, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 2.8 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 14,
                        background: isLight ? '#D20000' : '#ffffff',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                />
            </AnimatePresence>

            {/* Brand/red side icon (left) */}
            <motion.span
                animate={{ opacity: isLight ? 0.2 : 0.9 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute',
                    left: 7,
                    fontSize: 11,
                    lineHeight: 1,
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            >
                🔴
            </motion.span>

            {/* Light mode icon (right) */}
            <motion.span
                animate={{ opacity: isLight ? 0.85 : 0.2 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute',
                    right: 6,
                    fontSize: 11,
                    lineHeight: 1,
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            >
                ☀️
            </motion.span>

            {/* Sliding knob */}
            <motion.div
                animate={{ x: isLight ? 26 : 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: isLight ? '#D20000' : '#FFFFFF',
                    flexShrink: 0,
                    zIndex: 2,
                    position: 'relative',
                    boxShadow: isLight
                        ? '0 1px 6px rgba(210,0,0,0.5)'
                        : '0 1px 6px rgba(0,0,0,0.4)',
                    transition: 'background 0.3s ease',
                }}
            >
                {/* Eyelet */}
                <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: isLight ? 'rgba(255,255,255,0.4)' : 'rgba(210,0,0,0.4)',
                    display: 'block',
                }} />
            </motion.div>
        </motion.button>
    );
}
