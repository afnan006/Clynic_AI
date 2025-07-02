import React, { useState } from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { PhoneLogin } from '../components/auth/PhoneLogin';
import { ForgotPassword } from '../components/auth/ForgotPassword';

type AuthStep = 'login' | 'phone' | 'forgot';

export function Auth() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('UI', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  const getTitle = () => {
    switch (currentStep) {
      case 'phone':
        return 'Phone Verification';
      case 'forgot':
        return 'Reset Password';
      default:
        return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'login':
        return 'Sign in to access your healthcare assistant';
      default:
        return undefined;
    }
  };

  const renderAuthContent = () => {
    switch (currentStep) {
      case 'phone':
        return <PhoneLogin onBack={() => setCurrentStep('login')} />;
      case 'forgot':
        return <ForgotPassword onBack={() => setCurrentStep('login')} />;
      default:
        return (
          <LoginForm
            onSwitchToPhone={() => setCurrentStep('phone')}
            onForgotPassword={() => setCurrentStep('forgot')}
          />
        );
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      {renderAuthContent()}
    </AuthLayout>
  );
}