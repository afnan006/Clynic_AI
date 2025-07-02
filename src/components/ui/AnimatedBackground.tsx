import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedBackgroundProps {
  variant?: 'auth' | 'assessment' | 'chat';
  intensity?: 'subtle' | 'medium' | 'high';
  className?: string;
}

export function AnimatedBackground({
  variant = 'auth',
  intensity = 'subtle',
  className = '',
}: AnimatedBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  // Different color schemes based on variant
  const colorSchemes = {
    auth: {
      primary: 'from-primary-500/10 to-primary-600/10',
      secondary: 'from-secondary-500/10 to-secondary-600/10',
      accent: 'from-accent-500/5 to-accent-600/5',
    },
    assessment: {
      primary: 'from-primary-500/15 to-secondary-500/15',
      secondary: 'from-secondary-500/10 to-accent-500/10',
      accent: 'from-accent-500/5 to-primary-500/5',
    },
    chat: {
      primary: 'from-primary-500/5 to-secondary-500/5',
      secondary: 'from-secondary-500/5 to-accent-500/5',
      accent: 'from-accent-500/5 to-primary-500/5',
    },
  };

  // Animation speed based on intensity
  const speeds = {
    subtle: {
      duration1: 25,
      duration2: 30,
      duration3: 35,
    },
    medium: {
      duration1: 20,
      duration2: 25,
      duration3: 30,
    },
    high: {
      duration1: 15,
      duration2: 20,
      duration3: 25,
    },
  };

  const currentColors = colorSchemes[variant];
  const currentSpeeds = speeds[intensity];

  // Skip animations if user prefers reduced motion
  if (shouldReduceMotion) {
    return (
      <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r ${currentColors.primary} rounded-full blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r ${currentColors.secondary} rounded-full blur-3xl`} />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r ${currentColors.accent} rounded-full blur-2xl`} />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Top right blob */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: currentSpeeds.duration1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r ${currentColors.primary} rounded-full blur-3xl`}
      />

      {/* Bottom left blob */}
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: currentSpeeds.duration2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r ${currentColors.secondary} rounded-full blur-3xl`}
      />

      {/* Center blob */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: currentSpeeds.duration3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r ${currentColors.accent} rounded-full blur-2xl`}
      />

      {/* Additional floating particles for auth variant */}
      {variant === 'auth' && (
        <>
          <motion.div
            animate={{
              y: [-20, 20, -20],
              x: [10, -10, 10],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 right-1/4 w-16 h-16 bg-primary-500/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [15, -15, 15],
              x: [-5, 5, -5],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-secondary-500/10 rounded-full blur-xl"
          />
        </>
      )}
    </div>
  );
}