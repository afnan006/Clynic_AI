import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Input } from '../../ui/Input';
import { AnimatedBackground } from '../../ui/AnimatedBackground';

interface AgeQuestionProps {
  onValueChange: (value: number) => void;
  value?: number;
}

export function AgeQuestion({ onValueChange, value }: AgeQuestionProps) {
  const [age, setAge] = useState(value?.toString() || '');
  const [error, setError] = useState('');

  const handleChange = (newValue: string) => {
    setAge(newValue);
    setError('');
    
    const ageNum = parseInt(newValue);
    if (newValue && !isNaN(ageNum) && ageNum >= 1 && ageNum <= 120) {
      onValueChange(ageNum);
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
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-accent-500 to-primary-500 rounded-3xl mx-auto shadow-glow-primary"
        >
          <Calendar className="w-10 h-10 text-white" aria-hidden="true" />
        </motion.div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            How old are you?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-dark-300 text-lg"
          >
            Age helps us provide better recommendations
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => handleChange(e.target.value)}
            error={error}
            className="text-lg text-center"
            size="lg"
            min="1"
            max="120"
            autoFocus
          />
        </motion.div>
      </div>
    </div>
  );
}