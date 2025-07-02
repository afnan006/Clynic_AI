import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Input } from '../../ui/Input';
import { AnimatedBackground } from '../../ui/AnimatedBackground';

interface NameQuestionProps {
  onValueChange: (value: string) => void;
  value?: string;
}

export function NameQuestion({ onValueChange, value = '' }: NameQuestionProps) {
  const [name, setName] = useState(value);
  const [error, setError] = useState('');

  const handleChange = (newValue: string) => {
    setName(newValue);
    setError('');
    
    if (newValue.trim().length >= 2) {
      onValueChange(newValue.trim());
    }
  };

  return (
    <div className="h-screen flex items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground variant="assessment" intensity="subtle" />
      
      <div className="w-full max-w-2xl text-center space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl mx-auto shadow-glow-primary"
        >
          <User className="w-10 h-10 text-white" aria-hidden="true" />
        </motion.div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            What's your name?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-dark-300 text-lg"
          >
            Let's personalize your healthcare experience
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            error={error}
            className="text-lg text-center"
            size="lg"
            autoFocus
          />
        </motion.div>
      </div>
    </div>
  );
}