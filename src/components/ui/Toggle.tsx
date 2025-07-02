import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const sizeConfig = sizes[size];

  const motionProps = shouldReduceMotion ? {} : {
    whileTap: { scale: 0.95 },
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <label className="text-sm font-medium text-white block">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-dark-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <motion.button
        ref={ref}
        {...motionProps}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full
          cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none
          focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-dark-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${checked 
            ? 'bg-primary-500' 
            : 'bg-dark-700'
          }
          ${sizeConfig.track}
        `}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <motion.span
          initial={false}
          animate={{
            x: checked ? sizeConfig.translate.replace('translate-x-', '') : '0',
          }}
          transition={shouldReduceMotion ? { duration: 0 } : { 
            type: 'spring', 
            stiffness: 500, 
            damping: 30 
          }}
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow transform ring-0
            transition ease-in-out duration-200
            ${sizeConfig.thumb}
          `}
        />
      </motion.button>
    </div>
  );
});

Toggle.displayName = 'Toggle';