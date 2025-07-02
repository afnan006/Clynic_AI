import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

interface VoiceAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSpeaking: boolean;
  aiSpeaking: boolean;
  currentSubtitle?: string;
  showSubtitles: boolean;
  onToggleSubtitles: () => void;
}

// Enhanced 3D animated sphere component with depth
const AnimatedSphere = ({ 
  isActive, 
  color, 
  size = 120,
  label 
}: { 
  isActive: boolean; 
  color: string; 
  size?: number;
  label: string;
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sphereVariants = {
    idle: {
      scale: 1,
      opacity: 0.7,
      boxShadow: `
        0 0 30px ${color}40,
        inset 0 0 30px ${color}20,
        0 20px 40px rgba(0,0,0,0.3)
      `,
    },
    active: shouldReduceMotion ? {
      scale: 1.3,
      opacity: 1,
      boxShadow: `
        0 0 60px ${color}80,
        inset 0 0 40px ${color}40,
        0 30px 60px rgba(0,0,0,0.4)
      `,
    } : {
      scale: [1, 1.4, 1.2, 1.5, 1.1],
      opacity: [0.7, 1, 0.9, 1, 0.8],
      boxShadow: [
        `0 0 30px ${color}40, inset 0 0 30px ${color}20, 0 20px 40px rgba(0,0,0,0.3)`,
        `0 0 80px ${color}90, inset 0 0 50px ${color}50, 0 40px 80px rgba(0,0,0,0.5)`,
        `0 0 60px ${color}70, inset 0 0 40px ${color}30, 0 30px 60px rgba(0,0,0,0.4)`,
        `0 0 100px ${color}95, inset 0 0 60px ${color}60, 0 50px 100px rgba(0,0,0,0.6)`,
        `0 0 40px ${color}50, inset 0 0 35px ${color}25, 0 25px 50px rgba(0,0,0,0.35)`
      ],
    }
  };

  const pulseTransition = shouldReduceMotion ? {
    duration: 0.3
  } : {
    duration: 1.8,
    repeat: Infinity,
    ease: "easeInOut"
  };

  return (
    <motion.div
      className="relative rounded-full"
      style={{
        width: size,
        height: size,
        background: `
          radial-gradient(circle at 25% 25%, ${color}ff 0%, ${color}dd 30%, ${color}aa 60%, ${color}77 100%),
          linear-gradient(135deg, ${color}cc 0%, ${color}88 50%, ${color}44 100%)
        `,
        border: `3px solid ${color}bb`,
        filter: 'blur(0px)',
      }}
      variants={sphereVariants}
      animate={isActive ? "active" : "idle"}
      transition={isActive ? pulseTransition : { duration: 0.4 }}
    >
      {/* Multiple inner glow layers for depth */}
      <motion.div
        className="absolute inset-3 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${color}ff 0%, ${color}aa 40%, transparent 70%)`,
          filter: 'blur(1px)',
        }}
        animate={isActive ? {
          opacity: [0.6, 1, 0.7, 1, 0.6],
          scale: [1, 1.15, 1.05, 1.2, 1]
        } : { opacity: 0.4 }}
        transition={shouldReduceMotion ? {} : {
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Primary highlight for 3D effect */}
      <motion.div
        className="absolute top-3 left-3 rounded-full bg-white"
        style={{
          width: size * 0.2,
          height: size * 0.2,
          opacity: 0.6,
          filter: 'blur(2px)',
        }}
        animate={isActive ? {
          opacity: [0.6, 0.9, 0.7, 1, 0.6],
          scale: [1, 1.3, 1.1, 1.4, 1]
        } : { opacity: 0.3 }}
        transition={shouldReduceMotion ? {} : {
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Secondary highlight */}
      <motion.div
        className="absolute top-4 left-4 rounded-full bg-white"
        style={{
          width: size * 0.1,
          height: size * 0.1,
          opacity: 0.8,
        }}
        animate={isActive ? {
          opacity: [0.8, 1, 0.9, 1, 0.8],
          scale: [1, 1.2, 1.1, 1.3, 1]
        } : { opacity: 0.5 }}
        transition={shouldReduceMotion ? {} : {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Outer ripple effects when active */}
      <AnimatePresence>
        {isActive && !shouldReduceMotion && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${color}80` }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: `${color}60` }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Inner shadow for depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 70% 70%, transparent 30%, ${color}22 60%, ${color}44 100%)`,
          mixBlendMode: 'multiply',
        }}
      />
    </motion.div>
  );
};

export function VoiceAnimationModal({
  isOpen,
  onClose,
  userSpeaking,
  aiSpeaking,
  currentSubtitle = '',
  showSubtitles,
}: VoiceAnimationModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Auto-close modal when neither user nor AI is speaking for a while
  useEffect(() => {
    if (!userSpeaking && !aiSpeaking && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Close after 5 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [userSpeaking, aiSpeaking, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
    >
      {/* Close button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-3 bg-dark-800/80 backdrop-blur-sm border border-dark-600 rounded-full text-white hover:bg-dark-700/80 transition-all duration-200"
        aria-label="Close voice assistant"
      >
        <X className="w-6 h-6" />
      </motion.button>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Animated Spheres */}
        <div className="flex items-center justify-center space-x-20">
          {/* User Sphere */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <AnimatedSphere
              isActive={userSpeaking}
              color="#3b82f6" // Blue
              size={140}
              label="You"
            />
          </motion.div>

          {/* AI Sphere */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <AnimatedSphere
              isActive={aiSpeaking}
              color="#10b981" // Green
              size={140}
              label="AI"
            />
          </motion.div>
        </div>

        {/* Subtitle Display */}
        <AnimatePresence>
          {showSubtitles && currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-2xl mx-auto px-6"
            >
              <motion.p
                key={currentSubtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-xl font-medium text-center leading-relaxed"
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {currentSubtitle}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}