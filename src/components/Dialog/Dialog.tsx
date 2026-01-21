'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export default function Dialog({ isOpen, onClose, title, children, showCloseButton = true }: DialogProps) {
  // Prevent scroll and add blur effect to the scrollable container when dialog is open
  useEffect(() => {
    if (isOpen) {
      // Find the scrollable parent container
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.classList.add('overflow-hidden', 'blur-sm', 'transition-all', 'duration-200');
      }
    } else {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.classList.remove('overflow-hidden', 'blur-sm', 'transition-all', 'duration-200');
      }
    }
    return () => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      if (scrollContainer) {
        scrollContainer.classList.remove('overflow-hidden', 'blur-sm', 'transition-all', 'duration-200');
      }
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 dark:bg-black/70 z-40"
            onClick={onClose}
          />

          {/* Dialog Container */}
          <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              className="w-full md:w-auto md:min-w-[500px] md:max-w-2xl bg-white dark:bg-[#282828] border-[#1c54ff] dark:border-[#e4e9ff] rounded-t-2xl md:rounded-2xl shadow-2xl pointer-events-auto max-h-[70vh] md:max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  {title && <h2 className="text-xl font-semibold text-black dark:text-white">{title}</h2>}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                      aria-label="Close dialog"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-black dark:text-white"
                      >
                        <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Render to portal if available, otherwise render inline (fallback)
  if (typeof window !== 'undefined') {
    const portalElement = document.getElementById('dialog-portal');
    if (portalElement) {
      return createPortal(dialogContent, portalElement);
    }
  }

  return dialogContent;
}
