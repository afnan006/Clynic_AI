import React from 'react';
import { motion } from 'framer-motion';

interface VerticalProgressBarProps {
  current: number;
  total: number;
}

export function VerticalProgressBar({ current, total }: VerticalProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 h-full">
      <div className="relative h-full min-h-[80vh] max-h-[600px]">
        {/* Background track */}
        <div className="w-1 h-full bg-dark-800/50 rounded-full backdrop-blur-sm" />
        
        {/* Progress fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-0 left-0 w-1 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500 rounded-full shadow-glow-primary"
        />
        
        {/* Glowing dot at progress end */}
        <motion.div
          initial={{ top: 0 }}
          animate={{ top: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-400 rounded-full shadow-glow-primary"
        />
      </div>

      {/* Step Indicators - Clean circles without numbers */}
      <div className="flex flex-col space-y-3 mt-6">
        {Array.from({ length: total }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < current;
          const isCurrent = stepNumber === current;
          
          return (
            <motion.div
              key={stepNumber}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-300 ${
                isCompleted ? 'bg-success-500 text-white shadow-glow' : 
                isCurrent ? 'bg-primary-500 text-white shadow-glow-primary' : 
                'bg-dark-700 text-dark-400'
              }`}
            >
              {isCompleted ? '✓' : ''}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}