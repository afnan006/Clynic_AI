import React from 'react';
import { motion } from 'framer-motion';

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Check if it's the current year
      if (messageDate.getFullYear() === now.getFullYear()) {
        return messageDate.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'long'
        });
      } else {
        return messageDate.toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric'
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center my-4"
    >
      <div className="px-4 py-1 bg-dark-800/70 backdrop-blur-sm text-dark-300 text-xs font-medium rounded-full border border-dark-700/50">
        {formatDate(date)}
      </div>
    </motion.div>
  );
}