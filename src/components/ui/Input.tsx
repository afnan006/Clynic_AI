import React, { forwardRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'underlined';
  inputSize?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const baseClasses = `
    w-full transition-all duration-200 focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-dark-400
  `;

  const variants = {
    default: `
      bg-dark-800/50 border border-dark-700 rounded-xl text-white
      focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
      hover:border-dark-600
    `,
    filled: `
      bg-dark-800 border-0 rounded-xl text-white
      focus:ring-2 focus:ring-primary-500/20 focus:bg-dark-700
      hover:bg-dark-700/70
    `,
    underlined: `
      bg-transparent border-0 border-b-2 border-dark-700 rounded-none text-white
      focus:border-primary-500 hover:border-dark-600
    `,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const getStateClasses = () => {
    if (error) {
      return variant === 'underlined' 
        ? 'border-error-500 focus:border-error-500' 
        : 'border-error-500 focus:ring-error-500/20 focus:border-error-500';
    }
    if (success) {
      return variant === 'underlined'
        ? 'border-success-500 focus:border-success-500'
        : 'border-success-500 focus:ring-success-500/20 focus:border-success-500';
    }
    return '';
  };

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  return (
    <motion.div {...motionProps} className="space-y-2">
      {label && (
        <motion.label
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={shouldReduceMotion ? {} : { delay: 0.1 }}
          className={`
            block text-sm font-medium transition-colors duration-200
            ${error ? 'text-error-400' : success ? 'text-success-400' : 'text-dark-300'}
          `}
          htmlFor={props.id}
        >
          {label}
          {props.required && <span className="text-error-400 ml-1">*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`
            absolute left-3 top-1/2 transform -translate-y-1/2 z-10
            ${error ? 'text-error-400' : success ? 'text-success-400' : 'text-dark-400'}
            transition-colors duration-200 pointer-events-none
          `}>
            {React.cloneElement(leftIcon as React.ReactElement, { 
              size: iconSizes[inputSize] 
            })}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${baseClasses}
            ${variants[variant]}
            ${sizes[inputSize]}
            ${getStateClasses()}
            ${leftIcon ? (inputSize === 'sm' ? 'pl-9' : inputSize === 'lg' ? 'pl-12' : 'pl-11') : ''}
            ${(rightIcon || showPasswordToggle || error || success) ? (inputSize === 'sm' ? 'pr-9' : inputSize === 'lg' ? 'pr-12' : 'pr-11') : ''}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id}-error` : 
            success ? `${props.id}-success` : 
            helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {error && (
            <AlertCircle 
              size={iconSizes[inputSize]} 
              className="text-error-400" 
              aria-hidden="true"
            />
          )}
          {success && !error && (
            <CheckCircle 
              size={iconSizes[inputSize]} 
              className="text-success-400" 
              aria-hidden="true"
            />
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-dark-400 hover:text-white transition-colors focus:outline-none focus:text-primary-400"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={iconSizes[inputSize]} />
              ) : (
                <Eye size={iconSizes[inputSize]} />
              )}
            </button>
          )}
          {rightIcon && !error && !success && !showPasswordToggle && (
            <div className="text-dark-400">
              {React.cloneElement(rightIcon as React.ReactElement, { 
                size: iconSizes[inputSize] 
              })}
            </div>
          )}
        </div>
      </div>
      
      {(error || success || helperText) && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -5 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { duration: 0.2 }}
          className="space-y-1"
        >
          {error && (
            <p 
              id={`${props.id}-error`}
              className="text-sm text-error-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {success && !error && (
            <p 
              id={`${props.id}-success`}
              className="text-sm text-success-400 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              {success}
            </p>
          )}
          {helperText && !error && !success && (
            <p 
              id={`${props.id}-helper`}
              className="text-sm text-dark-400"
            >
              {helperText}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});

Input.displayName = 'Input';