import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Shield } from 'lucide-react';
import { Button } from './Button';

interface SecurityAlertProps {
  title: string;
  message: string;
  onDismiss?: () => void;
  severity?: 'high' | 'critical';
  actions?: React.ReactNode;
}

export function SecurityAlert({
  title,
  message,
  onDismiss,
  severity = 'high',
  actions
}: SecurityAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after a timeout for high severity alerts
  // Critical alerts require manual dismissal
  useEffect(() => {
    if (severity === 'high' && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [severity, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-0 left-0 right-0 z-50 p-4 ${
            severity === 'critical' ? 'bg-error-500' : 'bg-error-500/90'
          }`}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start space-x-4">
              {severity === 'critical' ? (
                <Shield className="w-6 h-6 text-white flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg">{title}</h3>
                <p className="text-white/90 mt-1">{message}</p>
                
                {actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white hover:bg-white/10 flex-shrink-0"
                aria-label="Dismiss security alert"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}