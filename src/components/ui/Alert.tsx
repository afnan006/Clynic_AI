import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  description,
  children,
  dismissible = false,
  onDismiss,
  icon,
  actions,
  className = '',
}: AlertProps) {
  const shouldReduceMotion = useReducedMotion();

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

  const variantConfig = variants[variant];
  const IconComponent = variantConfig.defaultIcon;

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: { duration: 0.3 },
  };

  return (
    <motion.div
      {...motionProps}
      className={`
        relative flex items-start space-x-3 p-4 border rounded-xl backdrop-blur-sm
        ${variantConfig.container}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${variantConfig.icon}`}>
        {icon || <IconComponent size={20} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-1">
            {title}
          </h4>
        )}
        
        {description && (
          <p className="text-sm opacity-90">
            {description}
          </p>
        )}
        
        {children && (
          <div className="mt-2">
            {children}
          </div>
        )}
        
        {actions && (
          <div className="mt-3 flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* Dismiss Button */}
      {dismissible && (
        <Button
          variant="ghost"
          size="xs"
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 -mr-1 -mt-1 hover:bg-white/10
            ${variantConfig.icon}
          `}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </Button>
      )}
    </motion.div>
  );
}