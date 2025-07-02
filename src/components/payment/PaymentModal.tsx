import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { PaymentModalProps, PaymentDetails, UpiApp } from '../../types/payment';
import { paymentService, UPI_APPS } from '../../services/PaymentService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Tabs } from '../ui/Tabs';
import { Alert } from '../ui/Alert';
import { useResponsive } from '../../hooks/useResponsive';

export function PaymentModal({
  isOpen,
  onClose,
  amount,
  currency = 'INR',
  reason = 'Chat Payment',
  onPaymentComplete
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('');
  const [customUpiId, setCustomUpiId] = useState('');
  const [upiIdError, setUpiIdError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [currentPayment, setCurrentPayment] = useState<PaymentDetails | null>(null);
  const [showUpiInput, setShowUpiInput] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { isMobile } = useResponsive();

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('PAYMENT_MODAL', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  useEffect(() => {
    if (isOpen) {
      logToConsole('Payment Modal Opened', {
        amount,
        currency,
        reason
      }, 'info');
      
      // Reset state when modal opens
      setPaymentStatus('idle');
      setCurrentPayment(null);
      setSelectedUpiApp('');
      setCustomUpiId('');
      setUpiIdError('');
      setShowUpiInput(false);
    }
  }, [isOpen, amount, currency, reason]);

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amt);
  };

  const validateAndSetUpiId = (upiId: string) => {
    setCustomUpiId(upiId);
    setUpiIdError('');
    
    if (upiId && !paymentService.validateUpiId(upiId)) {
      setUpiIdError('Please enter a valid UPI ID (e.g., username@bankname)');
    }
  };

  const handleUpiAppSelect = (app: UpiApp) => {
    setSelectedUpiApp(app.id);
    setShowUpiInput(false);
    setCustomUpiId('');
    setUpiIdError('');
    
    logToConsole('UPI App Selected', {
      appId: app.id,
      appName: app.name
    }, 'info');
  };

  const handleCustomUpiSelect = () => {
    setShowUpiInput(true);
    setSelectedUpiApp('');
    
    logToConsole('Custom UPI Selected', {}, 'info');
  };

  const handlePayment = async () => {
    if (selectedMethod === 'card') {
      logToConsole('Card Payment Attempted', {
        status: 'blocked',
        reason: 'Card payments not supported in demo'
      }, 'warn');
      return;
    }

    // Validate UPI payment
    let upiId = '';
    let upiApp = '';

    if (selectedUpiApp) {
      const app = UPI_APPS.find(a => a.id === selectedUpiApp);
      if (app) {
        upiApp = app.name;
        upiId = `demo@${app.id}`; // Mock UPI ID for app-based payments
      }
    } else if (showUpiInput) {
      if (!customUpiId || !paymentService.validateUpiId(customUpiId)) {
        setUpiIdError('Please enter a valid UPI ID');
        return;
      }
      upiId = customUpiId;
    } else {
      logToConsole('Payment Validation Failed', {
        reason: 'No UPI method selected'
      }, 'warn');
      return;
    }

    setPaymentStatus('processing');
    
    logToConsole('Payment Processing Started', {
      amount,
      method: selectedMethod,
      upiApp: upiApp || 'Custom UPI',
      maskedUpiId: upiId.replace(/(.{3}).*(@.*)/, '$1***$2')
    }, 'info');

    try {
      const payment = await paymentService.processUpiPayment(
        amount,
        upiId,
        reason,
        upiApp
      );

      setCurrentPayment(payment);
      setPaymentStatus(payment.status === 'success' ? 'success' : 'failed');
      
      if (payment.status === 'success') {
        logToConsole('Payment Completed Successfully', {
          paymentId: payment.id,
          transactionId: payment.transactionId,
          amount
        }, 'success');
        
        // Notify parent component
        onPaymentComplete(payment);
        
        // Auto-close modal after success
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        logToConsole('Payment Failed', {
          paymentId: payment.id,
          errorMessage: payment.errorMessage
        }, 'error');
      }
    } catch (error) {
      setPaymentStatus('failed');
      logToConsole('Payment Error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error');
    }
  };

  const copyTransactionId = () => {
    if (currentPayment?.transactionId) {
      navigator.clipboard.writeText(currentPayment.transactionId);
      logToConsole('Transaction ID Copied', {
        transactionId: currentPayment.transactionId
      }, 'info');
    }
  };

  const tabs = [
    {
      id: 'upi',
      label: 'UPI',
      icon: <Smartphone className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {/* UPI Apps */}
          <div>
            <h4 className="text-white font-medium mb-3">Choose UPI App</h4>
            <div className="grid grid-cols-1 gap-3">
              {UPI_APPS.map((app) => (
                <motion.button
                  key={app.id}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  onClick={() => handleUpiAppSelect(app)}
                  className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 ${
                    selectedUpiApp === app.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                  }`}
                >
                  <span className="text-2xl">{app.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{app.name}</p>
                    <p className="text-dark-400 text-sm">Pay with {app.name}</p>
                  </div>
                  {selectedUpiApp === app.id && (
                    <CheckCircle className="w-5 h-5 text-primary-400" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom UPI ID */}
          <div className="border-t border-dark-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Or enter UPI ID</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCustomUpiSelect}
                className={showUpiInput ? 'text-primary-400' : 'text-dark-400'}
              >
                {showUpiInput ? 'Selected' : 'Select'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showUpiInput && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, height: 'auto' }}
                  exit={shouldReduceMotion ? {} : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder="Enter UPI ID (e.g., username@paytm)"
                    value={customUpiId}
                    onChange={(e) => validateAndSetUpiId(e.target.value)}
                    error={upiIdError}
                    className="mb-2"
                  />
                  <p className="text-dark-400 text-xs">
                    Format: username@bankname (e.g., john@paytm, user@googlepay)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )
    },
    {
      id: 'card',
      label: 'Card',
      icon: <CreditCard className="w-4 h-4" />,
      content: (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">Card Payments Unavailable</h4>
          <p className="text-dark-400 text-sm">
            Card payments are not supported in demo mode. Please use UPI instead.
          </p>
        </div>
      )
    }
  ];

  const renderPaymentStatus = () => {
    if (paymentStatus === 'idle') return null;

    return (
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
        className="mt-6"
      >
        {paymentStatus === 'processing' && (
          <Card className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-4" />
            <h4 className="text-white font-medium mb-2">Processing Payment</h4>
            <p className="text-dark-400 text-sm">
              Please wait while we process your payment of {formatAmount(amount)}
            </p>
          </Card>
        )}

        {paymentStatus === 'success' && currentPayment && (
          <Card className="p-6 text-center border-success-500/20 bg-success-500/5">
            <motion.div
              initial={shouldReduceMotion ? {} : { scale: 0 }}
              animate={shouldReduceMotion ? {} : { scale: 1 }}
              transition={shouldReduceMotion ? {} : { type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-12 h-12 text-success-400 mx-auto mb-4" />
            </motion.div>
            <h4 className="text-success-400 font-semibold text-lg mb-2">Payment Successful!</h4>
            <p className="text-white mb-4">
              {formatAmount(amount)} paid successfully
            </p>
            
            {currentPayment.transactionId && (
              <div className="bg-dark-800/50 rounded-lg p-3 mb-4">
                <p className="text-dark-400 text-xs mb-1">Transaction ID</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="text-success-400 text-sm font-mono">
                    {currentPayment.transactionId}
                  </code>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={copyTransactionId}
                    className="p-1"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
            
            <p className="text-dark-400 text-xs">
              This modal will close automatically in a few seconds
            </p>
          </Card>
        )}

        {paymentStatus === 'failed' && currentPayment && (
          <Card className="p-6 text-center border-error-500/20 bg-error-500/5">
            <AlertCircle className="w-12 h-12 text-error-400 mx-auto mb-4" />
            <h4 className="text-error-400 font-semibold text-lg mb-2">Payment Failed</h4>
            <p className="text-white mb-2">
              Unable to process payment of {formatAmount(amount)}
            </p>
            {currentPayment.errorMessage && (
              <p className="text-error-400 text-sm mb-4">
                {currentPayment.errorMessage}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentStatus('idle')}
            >
              Try Again
            </Button>
          </Card>
        )}
      </motion.div>
    );
  };

  const canProceedWithPayment = () => {
    if (selectedMethod === 'card') return false;
    if (selectedMethod === 'upi') {
      return selectedUpiApp || (showUpiInput && customUpiId && !upiIdError);
    }
    return false;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      size={isMobile ? "full" : "md"}
      closeOnOverlayClick={paymentStatus === 'idle'}
    >
      <div className="space-y-4 p-2 sm:p-4">
        {/* Payment Amount */}
        <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl border border-primary-500/20">
          <h3 className="text-2xl font-bold text-white mb-1">
            {formatAmount(amount)}
          </h3>
          <p className="text-dark-400 text-sm">{reason}</p>
        </div>

        {/* Payment Status or Payment Methods */}
        {paymentStatus !== 'idle' ? (
          renderPaymentStatus()
        ) : (
          <>
            {/* Payment Method Tabs */}
            <Tabs
              tabs={tabs}
              defaultTab="upi"
              onTabChange={(tabId) => setSelectedMethod(tabId as 'upi' | 'card')}
            />

            {/* Pay Button */}
            <div className="flex space-x-3">
              <Button
                onClick={handlePayment}
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!canProceedWithPayment() || paymentStatus === 'processing'}
                isLoading={paymentStatus === 'processing'}
              >
                {paymentStatus === 'processing' ? 'Processing...' : `Pay ${formatAmount(amount)}`}
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                size="lg"
                disabled={paymentStatus === 'processing'}
              >
                Cancel
              </Button>
            </div>

            {/* Security Notice */}
            <Alert
              variant="info"
              description="This is a demo payment system. No real money will be charged."
              className="text-xs"
            />
          </>
        )}
      </div>
    </Modal>
  );
}