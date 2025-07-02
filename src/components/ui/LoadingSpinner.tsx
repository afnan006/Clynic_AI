import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  variant = 'spinner',
  text
}: LoadingSpinnerProps) {
  const shouldReduceMotion = useReducedMotion();

  const sizes = {
    xs: { spinner: 'w-3 h-3', dot: 'w-1 h-1', text: 'text-xs' },
    sm: { spinner: 'w-4 h-4', dot: 'w-1.5 h-1.5', text: 'text-sm' },
    md: { spinner: 'w-6 h-6', dot: 'w-2 h-2', text: 'text-base' },
    lg: { spinner: 'w-8 h-8', dot: 'w-2.5 h-2.5', text: 'text-lg' },
    xl: { spinner: 'w-12 h-12', dot: 'w-3 h-3', text: 'text-xl' },
  };

  const colors = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    white: 'text-white',
    current: 'text-current',
  };

  const spinnerVariants = {
    animate: shouldReduceMotion ? {} : {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const dotVariants = {
    animate: shouldReduceMotion ? {} : {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const pulseVariants = {
    animate: shouldReduceMotion ? {} : {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                variants={dotVariants}
                animate="animate"
                transition={{ delay: i * 0.2 }}
                className={`${sizes[size].dot} ${colors[color]} bg-current rounded-full`}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className={`${sizes[size].spinner} ${colors[color]} bg-current rounded-full`}
          />
        );

      case 'bars':
        return (
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={shouldReduceMotion ? {} : {
                  scaleY: [1, 2, 1],
                  transition: {
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  },
                }}
                className={`w-1 h-4 ${colors[color]} bg-current rounded-full`}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}
          </div>
        );

      default:
        return (
          <motion.div
            variants={spinnerVariants}
            animate="animate"
            className={`${sizes[size].spinner} ${colors[color]} border-4 border-current border-t-transparent rounded-full`}
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderSpinner()}
      {text && (
        <motion.p
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={shouldReduceMotion ? {} : { delay: 0.2 }}
          className={`${sizes[size].text} ${colors[color]} font-medium`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function SkeletonLoader({ 
  className = '',
  variant = 'rectangular',
  animation = 'pulse'
}: { 
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  animation?: 'pulse' | 'shimmer' | 'none';
}) {
  const shouldReduceMotion = useReducedMotion();

  const baseClasses = 'bg-dark-700/50';
  
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md h-4',
  };

  const animations = {
    pulse: shouldReduceMotion ? '' : 'animate-pulse',
    shimmer: shouldReduceMotion ? '' : 'relative overflow-hidden',
    none: '',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${animations[animation]} ${className}`}>
      {animation === 'shimmer' && !shouldReduceMotion && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
}