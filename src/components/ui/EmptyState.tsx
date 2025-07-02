import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const motionProps = shouldReduceMotion ? {} : {
    variants: containerVariants,
    initial: 'hidden',
    animate: 'visible',
  };

  return (
    <motion.div
      {...motionProps}
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          variants={shouldReduceMotion ? {} : itemVariants}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-800/50 rounded-2xl text-dark-400">
            {React.cloneElement(icon as React.ReactElement, { size: 32 })}
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        variants={shouldReduceMotion ? {} : itemVariants}
        className="text-xl font-semibold text-white mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          variants={shouldReduceMotion ? {} : itemVariants}
          className="text-dark-400 mb-6 max-w-md"
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          variants={shouldReduceMotion ? {} : itemVariants}
          className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3"
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'primary'}
              size="lg"
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size="lg"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}