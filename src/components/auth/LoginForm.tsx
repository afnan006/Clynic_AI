import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth.tsx';

interface LoginFormProps {
  onSwitchToPhone: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onSwitchToPhone, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, signInWithGoogle, authState } = useAuth();

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('UI', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  const validateForm = () => {
    logToConsole('Form Validation Started', { 
      hasEmail: !!email,
      hasPassword: !!password,
      emailLength: email.length,
      passwordLength: password.length
    }, 'info');

    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    logToConsole('Form Validation Complete', { 
      isValid,
      errors: Object.keys(newErrors)
    }, isValid ? 'success' : 'warn');
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logToConsole('Login Form Submit', { 
      email,
      formValid: validateForm()
    }, 'info');

    if (validateForm()) {
      logToConsole('Starting Email Sign In', { email }, 'info');
      await signIn(email, password);
    }
  };

  const handleGoogleSignIn = async () => {
    logToConsole('Google Sign In Button Clicked', {}, 'info');
    await signInWithGoogle();
  };

  const handleInputChange = (field: string, value: string) => {
    logToConsole('Input Changed', { 
      field,
      valueLength: value.length,
      hasValue: !!value
    }, 'info');

    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Login */}
      <Button
        onClick={handleGoogleSignIn}
        variant="outline"
        size="lg"
        className="w-full"
        isLoading={authState.isLoading}
        leftIcon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        }
      >
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-dark-800 text-dark-400">or</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          leftIcon={<Mail />}
        />
        
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          leftIcon={<Lock />}
          showPasswordToggle
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={authState.isLoading}
        >
          Sign In
        </Button>
      </form>

      {authState.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
        >
          {authState.error}
        </motion.div>
      )}

      {/* Alternative Options */}
      <div className="space-y-3 text-center">
        <button
          onClick={() => {
            logToConsole('Switch to Phone Login', {}, 'info');
            onSwitchToPhone();
          }}
          className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
        >
          Sign in with Phone Number
        </button>
        
        <button
          onClick={() => {
            logToConsole('Forgot Password Clicked', {}, 'info');
            onForgotPassword();
          }}
          className="block w-full text-dark-400 hover:text-white transition-colors text-sm"
        >
          Forgot your password?
        </button>
      </div>
    </div>
  );
}