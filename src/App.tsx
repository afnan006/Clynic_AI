import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ConsentModal } from './components/ConsentModal';
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { Assessment } from './pages/Assessment';
import { Chat } from './pages/Chat';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { DevConsole } from './components/dev/DevConsole';
import { InstallPWAPrompt } from './components/ui/InstallPWAPrompt';
import { testEncryptionUtilities } from './utils/encryption';
import { HelmetProvider } from 'react-helmet-async';
import { SecurityAlert } from './components/ui/SecurityAlert';

function AppRoutes() {
  const { authState, updateAgreedToTerms } = useAuth();
  const [hasVisitedLandingPage, setHasVisitedLandingPage] = useState(() => {
    return localStorage.getItem('hasVisitedLandingPage') === 'true';
  });
  const [securityAlert, setSecurityAlert] = useState<{title: string, message: string} | null>(null);

  const handleGetStarted = () => {
    localStorage.setItem('hasVisitedLandingPage', 'true');
    setHasVisitedLandingPage(true);
  };

  // Listen for security alerts
  useEffect(() => {
    const handleSecurityAlert = (event: CustomEvent) => {
      const { title, message } = event.detail;
      setSecurityAlert({ title, message });
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setSecurityAlert(null);
      }, 10000);
    };

    window.addEventListener('securityAlert', handleSecurityAlert as EventListener);
    
    return () => {
      window.removeEventListener('securityAlert', handleSecurityAlert as EventListener);
    };
  }, []);

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Show landing page for first-time visitors who are not authenticated
  if (!authState.user && !hasVisitedLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // No authenticated user - show auth page
  if (!authState.user) {
    return <Auth />;
  }

  // User authenticated but hasn't agreed to terms - show consent modal
  if (!authState.user.agreedToTerms) {
    return <ConsentModal onAccept={updateAgreedToTerms} />;
  }

  // User authenticated and agreed to terms but not onboarded - show assessment
  if (!authState.user.isOnboarded) {
    return <Assessment />;
  }

  // User fully authenticated, agreed to terms, and onboarded - show chat
  return <Chat />;
}

function App() {
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [securityAlert, setSecurityAlert] = useState<{title: string, message: string} | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for security alerts
  useEffect(() => {
    const handleSecurityAlert = (event: CustomEvent) => {
      const { title, message } = event.detail;
      setSecurityAlert({ title, message });
      
      // Auto-dismiss after 10 seconds for high severity alerts
      // Critical alerts would stay until manually dismissed
      setTimeout(() => {
        setSecurityAlert(null);
      }, 10000);
    };

    window.addEventListener('securityAlert', handleSecurityAlert as EventListener);
    
    return () => {
      window.removeEventListener('securityAlert', handleSecurityAlert as EventListener);
    };
  }, []);

  // Test encryption utilities on app load
  React.useEffect(() => {
    const runEncryptionTest = async () => {
      if (typeof window !== 'undefined' && (window as any).devConsole) {
        (window as any).devConsole.log('SYSTEM', 'App Initialized', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          cryptoSupported: !!window.crypto?.subtle,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          isOnline: navigator.onLine,
          isPWA: window.matchMedia('(display-mode: standalone)').matches
        }, 'info');

        // Test encryption utilities
        const testResult = await testEncryptionUtilities();
        (window as any).devConsole.log('SYSTEM', 'Encryption Test Complete', {
          success: testResult,
          timestamp: new Date().toISOString()
        }, testResult ? 'success' : 'error');
      }
    };

    // Delay to ensure dev console is initialized
    setTimeout(runEncryptionTest, 100);
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-dark-950 scrollbar-hide">
                {/* Security Alert */}
                {securityAlert && (
                  <SecurityAlert
                    title={securityAlert.title}
                    message={securityAlert.message}
                    onDismiss={() => setSecurityAlert(null)}
                    severity="high"
                  />
                )}
                
                {/* Offline notification */}
                {!isOnline && (
                  <div className="fixed top-0 left-0 right-0 bg-error-500 text-white text-center py-2 z-50">
                    You are currently offline. Some features may be limited.
                  </div>
                )}
                
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/*" element={<AppRoutes />} />
                  </Routes>
                </AnimatePresence>
                
                {/* Developer Console */}
                <DevConsole 
                  isOpen={isDevConsoleOpen} 
                  onToggle={() => setIsDevConsoleOpen(!isDevConsoleOpen)} 
                />
                
                {/* PWA Install Prompt */}
                <InstallPWAPrompt />
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;