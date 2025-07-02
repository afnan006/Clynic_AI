import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
      {/* Vertical Progress Bar for Mobile, Horizontal for Desktop */}
      <div className="w-full sm:w-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-dark-400">Progress</span>
          <span className="text-sm text-primary-400 font-medium">{current} of {total}</span>
        </div>
        
        {/* Mobile: Horizontal Bar */}
        <div className="block sm:hidden w-full h-2 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
          />
        </div>
        
        {/* Desktop: Vertical Bar */}
        <div className="hidden sm:block w-2 h-32 bg-dark-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full bg-gradient-to-t from-primary-500 to-secondary-500 rounded-full"
            style={{ marginTop: 'auto' }}
          />
        </div>
      </div>

      {/* Step Indicators for Desktop */}
      <div className="hidden sm:flex flex-col space-y-3">
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
              className={`flex items-center space-x-3 ${
                isCompleted ? 'text-success-400' : 
                isCurrent ? 'text-primary-400' : 
                'text-dark-500'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                isCompleted ? 'bg-success-500 text-white' :
                isCurrent ? 'bg-primary-500 text-white' :
                'bg-dark-700 text-dark-400'
              }`}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span className="text-sm font-medium">
                {stepNumber === 1 ? 'Name' :
                 stepNumber === 2 ? 'Age' :
                 stepNumber === 3 ? 'Phone' :
                 stepNumber === 4 ? 'Diabetes' :
                 'Blood Pressure'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}