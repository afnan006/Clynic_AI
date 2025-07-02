import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="bg-dark-800/60 backdrop-blur-sm border border-dark-700/50 rounded-2xl px-4 py-3 max-w-[200px]">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-primary-400" />
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 bg-primary-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}