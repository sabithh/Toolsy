'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'default' | 'success';
}

export default function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default'
}: ModalProps) {

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-black border border-white/20 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] relative"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {variant === 'danger' && <AlertTriangle className="text-[#DC2626]" />}
                                    {variant === 'success' && <CheckCircle className="text-green-500" />}
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                                        {title}
                                    </h2>
                                </div>
                                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <p className="text-gray-400 font-mono text-sm leading-relaxed uppercase">
                                    {description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 py-3 font-bold uppercase tracking-widest text-white transition-all
                                        ${variant === 'danger'
                                            ? 'bg-[#DC2626] hover:bg-red-700'
                                            : variant === 'success'
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-white text-black hover:bg-gray-200'}
                                    `}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
