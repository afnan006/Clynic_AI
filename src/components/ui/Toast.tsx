import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]; 
  onRemove: (id: string) => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ 
  toast, 
  onRemove, 
  shouldReduceMotion 
}: { 
  toast: Toast; 
  onRemove: (id: string) => void;
  shouldReduceMotion: boolean;
}) {
  const variants = {
    info: {
      container: 'bg-primary-500/10 border-primary-500/20 text-primary-100',
      icon: 'text-primary-400',
      defaultIcon: Info,
    },
    success: {
      container: 'bg-success-500/10 border-success-500/20 text-success-100',
      icon: 'text-success-400',
      defaultIcon: CheckCircle,
    },
    warning: {
      container: 'bg-warning-500/10 border-warning-500/20 text-warning-100',
      icon: 'text-warning-400',
      defaultIcon: AlertTriangle,
    },
    error: {
      container: 'bg-error-500/10 border-error-500/20 text-error-100',
      icon: 'text-error-400',
      defaultIcon: AlertCircle,
    },
  };

  const variantConfig = variants[toast.variant];
  const IconComponent = variantConfig.defaultIcon;

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, x: 300, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 300, scale: 0.95 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };

  return (
    <motion.div
      {...motionProps}
      className={`
        relative flex items-start space-x-3 p-4 border rounded-xl backdrop-blur-xl shadow-soft-lg
        ${variantConfig.container}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${variantConfig.icon}`}>
        <IconComponent size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="font-semibold text-sm mb-1">
            {toast.title}
          </h4>
        )}
        
        {toast.description && (
          <p className="text-sm opacity-90">
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      {toast.dismissible !== false && (
        <button
          onClick={() => onRemove(toast.id)}
          className={`
            flex-shrink-0 p-1 -mr-1 -mt-1 rounded-lg hover:bg-white/10 
            transition-colors focus:outline-none focus:ring-2 focus:ring-white/20
            ${variantConfig.icon}
          `}
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}