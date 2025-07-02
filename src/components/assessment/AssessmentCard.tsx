import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface AssessmentCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AssessmentCard({ children, className = '' }: AssessmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`w-full max-w-lg mx-auto ${className}`}
    >
      <Card gradient className="p-6 sm:p-8 backdrop-blur-xl border-dark-600/50">
        {children}
      </Card>
    </motion.div>
  );
}