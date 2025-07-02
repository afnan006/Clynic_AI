import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Shield, Lock, FileText, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ConsentModalProps {
  onAccept: () => void;
}

export function ConsentModal({ onAccept }: ConsentModalProps) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('CONSENT', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  const handleAccept = () => {
    if (!hasAgreed) return;
    
    logToConsole('Terms Accepted', {
      agreedToTerms: true,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }, 'success');
    
    onAccept();
  };

  const handleCheckboxChange = (checked: boolean) => {
    setHasAgreed(checked);
    logToConsole('Checkbox Changed', {
      agreed: checked
    }, 'info');
  };

  const motionProps = shouldReduceMotion ? {} : {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: 'easeOut' },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <motion.div
        {...motionProps}
        className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-full max-h-[95vh] flex flex-col"
      >
        <Card gradient className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 backdrop-blur-xl border-dark-600/50 overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <motion.div
                initial={shouldReduceMotion ? {} : { scale: 0 }}
                animate={shouldReduceMotion ? {} : { scale: 1 }}
                transition={shouldReduceMotion ? {} : { delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl sm:rounded-3xl mx-auto mb-3 sm:mb-4 md:mb-6 shadow-glow-primary"
              >
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </motion.div>

              <motion.h1
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? {} : { delay: 0.3 }}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2"
              >
                Privacy & Security Notice
              </motion.h1>
              
              <motion.p
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? {} : { delay: 0.4 }}
                className="text-dark-300 text-xs sm:text-sm md:text-base"
              >
                Your privacy and data security are our top priorities
              </motion.p>
            </div>

            {/* Content */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-4 sm:mb-6 md:mb-8">
              {/* HIPAA Compliance */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                transition={shouldReduceMotion ? {} : { delay: 0.5 }}
                className="flex items-start space-x-2 sm:space-x-3 md:space-x-4 p-2 sm:p-3 md:p-4 bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl"
              >
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500/20 rounded-md sm:rounded-lg flex items-center justify-center">
                  <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold mb-1 text-xs sm:text-sm md:text-base">HIPAA Compliant</h3>
                  <p className="text-green-300 text-xs sm:text-sm leading-relaxed">
                    This application is fully HIPAA compliant, ensuring your protected health information (PHI) 
                    is handled according to the highest healthcare privacy standards.
                  </p>
                </div>
              </motion.div>

              {/* End-to-End Encryption */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                transition={shouldReduceMotion ? {} : { delay: 0.6 }}
                className="flex items-start space-x-2 sm:space-x-3 md:space-x-4 p-2 sm:p-3 md:p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg sm:rounded-xl"
              >
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-primary-500/20 rounded-md sm:rounded-lg flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-semibold mb-1 text-xs sm:text-sm md:text-base">End-to-End Encryption</h3>
                  <p className="text-primary-300 text-xs sm:text-sm leading-relaxed">
                    All your messages, health data, and personal information are encrypted using 
                    <span className="font-medium"> AES-256-GCM encryption</span> before being transmitted or stored. 
                    Only you can decrypt and access your data.
                  </p>
                </div>
              </motion.div>

              {/* Data Protection */}
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                transition={shouldReduceMotion ? {} : { delay: 0.7 }}
                className="p-2 sm:p-3 md:p-4 bg-dark-800/50 border border-dark-700/50 rounded-lg sm:rounded-xl"
              >
                <h3 className="text-white font-semibold mb-2 text-xs sm:text-sm md:text-base">What this means for you:</h3>
                <ul className="text-dark-300 text-xs sm:text-sm space-y-1 leading-relaxed">
                  <li>• Your health conversations are completely private</li>
                  <li>• Your data is encrypted both in transit and at rest</li>
                  <li>• We cannot read your messages or access your personal information</li>
                  <li>• You maintain full control over your health data</li>
                  <li>• All data handling complies with HIPAA regulations</li>
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Fixed Footer - Terms Agreement */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? {} : { delay: 0.8 }}
            className="flex-shrink-0 space-y-3 sm:space-y-4 md:space-y-6 pt-3 sm:pt-4 border-t border-dark-700/50"
          >
            {/* Checkbox */}
            <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5 sm:mt-1">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => handleCheckboxChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 border-2 rounded transition-all duration-200 ${
                  hasAgreed 
                    ? 'bg-primary-500 border-primary-500' 
                    : 'border-dark-600 group-hover:border-primary-500'
                }`}>
                  {hasAgreed && (
                    <motion.div
                      initial={shouldReduceMotion ? {} : { scale: 0 }}
                      animate={shouldReduceMotion ? {} : { scale: 1 }}
                      transition={shouldReduceMotion ? {} : { type: 'spring', stiffness: 300 }}
                    >
                      <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white m-0.5" />
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-dark-300 leading-relaxed min-w-0 flex-1">
                I acknowledge that I have read and understand the privacy and security measures in place. 
                I agree to the{' '}
                <button className="text-primary-400 hover:text-primary-300 underline">
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button className="text-primary-400 hover:text-primary-300 underline">
                  Privacy Policy
                </button>
                , and I consent to the collection and processing of my health information 
                in accordance with HIPAA regulations.
              </div>
            </label>

            {/* Continue Button */}
            <Button
              onClick={handleAccept}
              disabled={!hasAgreed}
              variant="primary"
              size={window.innerWidth < 640 ? "md" : "lg"}
              className="w-full"
              leftIcon={<Shield />}
            >
              Continue to Assessment
            </Button>

            <p className="text-xs text-dark-500 text-center leading-relaxed">
              By continuing, you confirm that you are at least 18 years old and have the legal capacity to agree to these terms.
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}