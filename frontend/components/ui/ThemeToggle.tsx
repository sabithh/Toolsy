'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme, isLight } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.85 }}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{
                position: 'relative',
                width: 56,
                height: 28,
                borderRadius: 14,
                border: isLight ? '1px solid #D8D8D8' : '1px solid #2A2A2A',
                background: isLight ? '#EBEBEB' : 'var(--bg-surface)',
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
            {/* Flash ripple on every toggle */}
            <AnimatePresence mode="wait">
                <motion.span
                    key={theme}
                    initial={{ opacity: 0.7, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 2.8 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 14,
                        background: '#D20000',
                        pointerEvents: 'none',
                        zIndex: 1,
                    }}
                />
            </AnimatePresence>

            {/* Moon — visible in dark mode, fades out in light */}
            <motion.span
                animate={{ opacity: isLight ? 0.15 : 0.75, x: isLight ? -2 : 0 }}
                transition={{ duration: 0.35 }}
                style={{
                    position: 'absolute',
                    left: 7,
                    fontSize: 11,
                    lineHeight: 1,
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            >
                🌙
            </motion.span>

            {/* Sun — visible in light mode, fades out in dark */}
            <motion.span
                animate={{ opacity: isLight ? 0.85 : 0.15, x: isLight ? 0 : 2 }}
                transition={{ duration: 0.35 }}
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
                    background: '#D20000',
                    flexShrink: 0,
                    zIndex: 2,
                    position: 'relative',
                    boxShadow: '0 1px 6px rgba(210,0,0,0.5)',
                }}
            >
                {/* Tiny eyelet circle inside knob — matches Vaadaka icon */}
                <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.35)',
                    display: 'block',
                }} />
            </motion.div>
        </motion.button>
    );
}
