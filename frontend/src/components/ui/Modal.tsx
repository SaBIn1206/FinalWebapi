'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  tone?: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible, portal-based modal. Replaces the inline <div> "showModal"
 * blocks previously scattered across admin CRUD forms.
 */
export function Modal({ open, onClose, title, tone = 'light', children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[var(--radius-card)] border p-6 shadow-2xl',
          tone === 'light' ? 'bg-surface border-border' : 'bg-night-elevated border-night-border text-night-ink',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-bold">{title}</h3>}
          <button
            onClick={onClose}
            aria-label="Close"
            className={cn('ml-auto p-1.5 rounded-lg hover:bg-surface-muted', tone === 'dark' && 'hover:bg-night-border')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
