import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CheckCircle } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { authApi } from '../../../api/auth/authApi';
import { AnimatedBackground } from '../../ui/AnimatedBackground';

interface PhoneQuestionProps {
  onValueChange: (value: string) => void;
  onAdvance: () => void;
  value?: string;
}

export function PhoneQuestion({ onValueChange, onAdvance, value = '' }: PhoneQuestionProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(value);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authApi.sendOTP(phone);
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    // Mock OTP validation - check for 123456
    if (otp !== '123456') {
      setError('Invalid OTP. Please enter 123456');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      onValueChange(phone);
      onAdvance(); // Auto-advance to next question
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
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
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-3xl mx-auto shadow-glow-secondary"
        >
          {step === 'otp' ? (
            <CheckCircle className="w-10 h-10 text-white" aria-hidden="true" />
          ) : (
            <Phone className="w-10 h-10 text-white" aria-hidden="true" />
          )}
        </motion.div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            {step === 'phone' ? 'Verify your phone number' : 'Enter verification code'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-dark-300 text-lg"
          >
            {step === 'phone' 
              ? 'We\'ll send you a verification code' 
              : `Code sent to ${phone} (use 123456)`
            }
          </motion.p>
        </div>

        {step === 'phone' ? (
          <motion.form
            onSubmit={handleSendOTP}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto space-y-6"
          >
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              error={error}
              className="text-lg text-center"
              size="lg"
              autoFocus
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Send Verification Code
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-form"
            onSubmit={handleVerifyOTP}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto space-y-6"
          >
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError('');
              }}
              error={error}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
              size="lg"
              autoFocus
            />

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Verify & Continue
              </Button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-dark-400 hover:text-white transition-colors text-sm"
              >
                Change phone number
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}