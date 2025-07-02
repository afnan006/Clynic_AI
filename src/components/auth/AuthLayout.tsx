import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { Helmet } from 'react-helmet-async';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Clynic AI</title>
        <meta name="description" content="Secure access to your healthcare assistant. Sign in to Clynic AI to manage your health with AI-powered guidance and military-grade security." />
      </Helmet>
      
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        {/* Animated Background */}
        <AnimatedBackground variant="auth" intensity="subtle" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-3 shadow-glow">
              <Heart className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold bg-gradient-to-r from-white to-dark-200 bg-clip-text text-transparent"
            >
              {import.meta.env.VITE_APP_NAME}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-dark-400 mt-1 text-sm"
            >
              {import.meta.env.VITE_APP_TAGLINE}
            </motion.p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-dark-800/30 backdrop-blur-xl border border-dark-700/50 rounded-2xl p-6 shadow-soft-lg"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
              {subtitle && (
                <p className="text-dark-400 text-sm">{subtitle}</p>
              )}
            </div>
            {children}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-dark-400 text-xs mt-4"
          >
            Built for the future of healthcare
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}