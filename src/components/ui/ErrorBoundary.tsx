import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    
    // Log to dev console if available
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ERROR_BOUNDARY', 'Component Error Caught', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      }, 'error');
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full text-center space-y-6"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-error-500/20 rounded-full mx-auto"
            >
              <AlertTriangle className="w-10 h-10 text-error-400" />
            </motion.div>

            {/* Error Message */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white"
              >
                Something went wrong
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-dark-400"
              >
                We encountered an unexpected error. This has been logged and we'll look into it.
              </motion.p>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.details
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-left"
                >
                  <summary className="cursor-pointer text-sm text-dark-400 hover:text-white">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-dark-800/50 rounded-lg border border-dark-700">
                    <pre className="text-xs text-error-400 whitespace-pre-wrap overflow-auto">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </div>
                </motion.details>
              )}
            </div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={this.handleRetry}
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<RefreshCw size={20} />}
              >
                Try Again
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Home size={20} />}
              >
                Go Home
              </Button>
            </motion.div>

            {/* Support Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-dark-500"
            >
              If this problem persists, please contact support with the error details above.
            </motion.p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // Log to dev console if available
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ERROR_HANDLER', 'Manual Error Report', {
        error: error.message,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString()
      }, 'error');
    }
    
    // You could also send to an error reporting service here
    throw error; // Re-throw to be caught by ErrorBoundary
  };
}