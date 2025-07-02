import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  const baseClasses = `
    relative inline-flex items-center justify-center font-medium rounded-xl 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
    focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-95 select-none
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 
      text-white shadow-soft hover:shadow-soft-lg focus:ring-primary-500/50
      disabled:from-primary-400 disabled:to-primary-400
    `,
    secondary: `
      bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 
      text-white shadow-soft hover:shadow-soft-lg focus:ring-secondary-500/50
      disabled:from-secondary-400 disabled:to-secondary-400
    `,
    outline: `
      border-2 border-dark-700 hover:border-primary-500 text-dark-300 hover:text-primary-400 
      hover:bg-primary-500/10 focus:ring-primary-500/50 backdrop-blur-sm
      disabled:border-dark-800 disabled:text-dark-500
    `,
    ghost: `
      text-dark-300 hover:text-white hover:bg-dark-800/50 focus:ring-dark-700/50
      disabled:text-dark-600
    `,
    destructive: `
      bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 
      text-white shadow-soft hover:shadow-soft-lg focus:ring-error-500/50
      disabled:from-error-400 disabled:to-error-400
    `,
    success: `
      bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 
      text-white shadow-soft hover:shadow-soft-lg focus:ring-success-500/50
      disabled:from-success-400 disabled:to-success-400
    `,
    warning: `
      bg-gradient-to-r from-warning-500 to-warning-600 hover:from-warning-600 hover:to-warning-700 
      text-white shadow-soft hover:shadow-soft-lg focus:ring-warning-500/50
      disabled:from-warning-400 disabled:to-warning-400
    `,
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5',
    xl: 'px-10 py-5 text-xl gap-3',
  };

  const motionProps = shouldReduceMotion ? {} : {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  };

  return (
    <motion.button
      ref={ref}
      {...motionProps}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-describedby={isLoading ? 'loading-description' : undefined}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} />
      )}
      {!isLoading && leftIcon && leftIcon}
      <span className={isLoading ? 'opacity-70' : ''}>
        {isLoading && loadingText ? loadingText : children}
      </span>
      {!isLoading && rightIcon && rightIcon}
      {isLoading && (
        <span id="loading-description" className="sr-only">
          Loading, please wait
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';