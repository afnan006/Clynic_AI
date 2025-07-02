import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth.tsx';
import { authApi } from '../../api/auth/authApi';

interface PhoneLoginProps {
  onBack: () => void;
}

export function PhoneLogin({ onBack }: PhoneLoginProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithPhone } = useAuth();

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('UI', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logToConsole('Send OTP Started', { 
      phone,
      phoneLength: phone.length
    }, 'info');

    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      logToConsole('Send OTP Validation Failed', { phone }, 'warn');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authApi.sendOTP(phone);
      setStep('otp');
      logToConsole('OTP Sent Successfully', { phone }, 'success');
    } catch (err) {
      const errorMsg = 'Failed to send OTP. Please try again.';
      setError(errorMsg);
      logToConsole('Send OTP Failed', { 
        phone,
        error: err instanceof Error ? err.message : 'Unknown error'
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logToConsole('Verify OTP Started', { 
      phone,
      otpLength: otp.length
    }, 'info');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      logToConsole('OTP Validation Failed', { otpLength: otp.length }, 'warn');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await signInWithPhone(phone, otp);
      logToConsole('Phone Sign In Complete', { phone }, 'success');
    } catch (err) {
      const errorMsg = 'Invalid OTP. Please try again.';
      setError(errorMsg);
      logToConsole('Phone Sign In Failed', { 
        phone,
        error: err instanceof Error ? err.message : 'Unknown error'
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    logToConsole('Phone Input Changed', { 
      field,
      valueLength: value.length
    }, 'info');

    if (field === 'phone') {
      setPhone(value);
    } else if (field === 'otp') {
      setOtp(value);
    }
    setError('');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          logToConsole('Back to Login Clicked', {}, 'info');
          onBack();
        }}
        className="flex items-center text-dark-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to login options
      </button>

      {step === 'phone' ? (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSendOTP}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Phone Verification</h3>
            <p className="text-dark-400">We'll send you a verification code</p>
          </div>

          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={error}
            leftIcon={<Phone />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Send OTP
          </Button>
        </motion.form>
      ) : (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleVerifyOTP}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Enter Verification Code</h3>
            <p className="text-dark-400">Code sent to {phone}</p>
          </div>

          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => handleInputChange('otp', e.target.value)}
            error={error}
            maxLength={6}
            className="text-center text-2xl tracking-widest"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Verify & Sign In
          </Button>

          <button
            type="button"
            onClick={() => {
              logToConsole('Change Phone Number', {}, 'info');
              setStep('phone');
            }}
            className="w-full text-dark-400 hover:text-white transition-colors text-sm"
          >
            Change phone number
          </button>
        </motion.form>
      )}
    </div>
  );
}