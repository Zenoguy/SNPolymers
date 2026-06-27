import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Reusable modal dialog component using React Portals.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg', // 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-5xl' etc.
  showCloseButton = true,
  className = '',
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Backdrop click-to-close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className={`glass-panel w-full ${maxWidth} rounded-3xl p-6 md:p-8 relative glow-border-active shadow-2xl z-10 ${className}`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 text-lg transition-colors p-1"
            title="Close"
          >
            ✕
          </button>
        )}

        {subtitle && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 block mb-1">
            {subtitle}
          </span>
        )}

        {title && (
          <h2 className="text-xl font-extrabold text-slate-100 mb-6">
            {title}
          </h2>
        )}

        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
