import React, { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  hover?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  hover = false,
  gradient = false,
  padding = 'md',
  rounded = 'xl',
  className = '',
  ...props
}, ref) => {
  const shouldReduceMotion = useReducedMotion();

  const baseClasses = `
    relative overflow-hidden transition-all duration-300
  `;

  const variants = {
    default: `
      ${gradient 
        ? 'bg-gradient-to-br from-dark-800/50 to-dark-900/50' 
        : 'bg-dark-800/30'
      }
      backdrop-blur-xl border border-dark-700/50 shadow-soft
    `,
    elevated: `
      ${gradient 
        ? 'bg-gradient-to-br from-dark-800/70 to-dark-900/70' 
        : 'bg-dark-800/50'
      }
      backdrop-blur-xl border border-dark-700/30 shadow-soft-lg
    `,
    outlined: `
      bg-transparent border-2 border-dark-700/50 hover:border-dark-600/50
    `,
    filled: `
      ${gradient 
        ? 'bg-gradient-to-br from-dark-800 to-dark-900' 
        : 'bg-dark-800'
      }
      border border-dark-700/30 shadow-inner-soft
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-4xl',
    '3xl': 'rounded-5xl',
  };

  const hoverClasses = hover ? `
    hover:shadow-soft-xl hover:border-primary-500/30 hover:-translate-y-1
    hover:scale-[1.02] cursor-pointer
  ` : '';

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    ...(hover && {
      whileHover: { 
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 }
      },
    }),
  };

  return (
    <motion.div
      ref={ref}
      {...motionProps}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${paddings[padding]}
        ${roundedClasses[rounded]}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';