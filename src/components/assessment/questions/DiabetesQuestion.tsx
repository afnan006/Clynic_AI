import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Button } from '../../ui/Button';
import { AnimatedBackground } from '../../ui/AnimatedBackground';

interface DiabetesQuestionProps {
  onValueChange: (value: boolean) => void;
  onAdvance: () => void;
  value?: boolean;
}

export function DiabetesQuestion({ onValueChange, onAdvance, value }: DiabetesQuestionProps) {
  const handleAnswer = (hasDiabetes: boolean) => {
    onValueChange(hasDiabetes);
    // Auto-advance to next question after selection
    setTimeout(() => {
      onAdvance();
    }, 300); // Small delay for visual feedback
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
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl mx-auto shadow-glow"
        >
          <Activity className="w-10 h-10 text-white" aria-hidden="true" />
        </motion.div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Do you have Diabetes?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-dark-300 text-lg"
          >
            This helps us provide personalized health recommendations
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto space-y-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => handleAnswer(true)}
              variant={value === true ? "primary" : "outline"}
              size="lg"
              className={`w-full justify-center ${
                value === true 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500 text-red-300 hover:text-red-200'
              }`}
            >
              Yes, I have diabetes
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => handleAnswer(false)}
              variant={value === false ? "primary" : "outline"}
              size="lg"
              className={`w-full justify-center ${
                value === false 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:border-green-500 text-green-300 hover:text-green-200'
              }`}
            >
              No, I don't have diabetes
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}