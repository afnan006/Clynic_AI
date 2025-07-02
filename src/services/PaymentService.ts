import { PaymentDetails, UpiApp } from '../types';
import { paymentApi } from '../api/payment/paymentApi';

export const UPI_APPS: UpiApp[] = [
  {
    id: 'googlepay',
    name: 'Google Pay',
    icon: '🟢',
    packageName: 'com.google.android.apps.nbu.paisa.user'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '🟣',
    packageName: 'com.phonepe.app'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: '🔵',
    packageName: 'net.one97.paytm'
  }
];

class PaymentService {
  private payments: PaymentDetails[] = [];

  constructor() {
    this.loadPayments();
    this.logToConsole('PaymentService Initialized', {
      storedPayments: this.payments.length
    }, 'success', 'Payment service is ready to process transactions');
  }

  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('PAYMENT', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  private loadPayments(): void {
    try {
      const stored = localStorage.getItem('payment_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.payments = parsed.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
      }
    } catch (error) {
      this.logToConsole('Failed to Load Payment History', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'warn', 'Using empty payment history instead');
      this.payments = [];
    }
  }

  private savePayments(): void {
    try {
      localStorage.setItem('payment_history', JSON.stringify(this.payments));
    } catch (error) {
      this.logToConsole('Failed to Save Payment History', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Payment history could not be saved');
    }
  }

  public validateUpiId(upiId: string): boolean {
    // UPI ID format: username@bankname
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    const isValid = upiRegex.test(upiId);
    
    this.logToConsole('UPI ID Validation', {
      upiId: upiId.replace(/(.{3}).*(@.*)/, '$1***$2'), // Mask for privacy
      isValid,
      format: 'username@bankname'
    }, isValid ? 'success' : 'warn', `UPI ID ${isValid ? 'is valid' : 'format is invalid'}`);
    
    return isValid;
  }

  public async processUpiPayment(
    amount: number,
    upiId: string,
    reason: string,
    upiApp?: string
  ): Promise<PaymentDetails> {
    const paymentId = this.generatePaymentId();
    
    const payment: PaymentDetails = {
      id: paymentId,
      amount,
      currency: 'INR',
      method: 'upi',
      upiId,
      upiApp,
      status: 'processing',
      reason,
      timestamp: new Date()
    };

    this.logToConsole('UPI Payment Processing Started', {
      paymentId,
      amount,
      currency: payment.currency,
      upiApp,
      maskedUpiId: upiId.replace(/(.{3}).*(@.*)/, '$1***$2'),
      reason
    }, 'info', `Processing ₹${amount} payment via ${upiApp || 'UPI'} to ${upiId.replace(/(.{3}).*(@.*)/, '$1***$2')}`);

    // Record payment immediately
    this.recordPayment(payment);

    try {
      // Process payment through API
      const response = await paymentApi.processPayment({
        amount,
        currency: 'INR',
        method: 'upi',
        upiId,
        upiApp,
        reason,
        userId: this.getCurrentUserId() || 'anonymous'
      });

      // Update payment with response data
      const updatedPayment = response.payment;
      this.updatePayment(updatedPayment);

      if (updatedPayment.status === 'success') {
        this.logToConsole('UPI Payment Success', {
          paymentId: updatedPayment.id,
          transactionId: updatedPayment.transactionId,
          amount,
          upiApp
        }, 'success', `Payment of ₹${amount} completed successfully with transaction ID ${updatedPayment.transactionId}`);
      } else {
        this.logToConsole('UPI Payment Failed', {
          paymentId: updatedPayment.id,
          amount,
          errorMessage: updatedPayment.errorMessage,
          upiApp
        }, 'error', `Payment of ₹${amount} failed: ${updatedPayment.errorMessage}`);
      }

      // Simulate opening UPI app (for demo purposes)
      if (upiApp && updatedPayment.status === 'success') {
        this.simulateUpiAppOpen(upiApp, amount, upiId);
      }

      return updatedPayment;
    } catch (error) {
      // Handle API errors
      payment.status = 'failed';
      payment.errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      this.updatePayment(payment);

      this.logToConsole('UPI Payment Error', {
        paymentId,
        amount,
        error: payment.errorMessage,
        upiApp
      }, 'error', `Payment of ₹${amount} failed with error: ${payment.errorMessage}`);

      return payment;
    }
  }

  private simulateUpiAppOpen(upiApp: string, amount: number, upiId: string): void {
    this.logToConsole('UPI App Simulation', {
      app: upiApp,
      amount,
      action: 'Opening payment interface'
    }, 'info', `Simulating ${upiApp} opening for ₹${amount} payment`);

    // In a real implementation, this would use deep linking:
    // const upiUrl = `upi://pay?pa=${upiId}&pn=Merchant&am=${amount}&cu=INR&tn=${reason}`;
    // window.open(upiUrl, '_blank');
  }

  public recordPayment(payment: PaymentDetails): void {
    const existingIndex = this.payments.findIndex(p => p.id === payment.id);
    
    if (existingIndex !== -1) {
      this.payments[existingIndex] = payment;
    } else {
      this.payments.unshift(payment);
    }
    
    this.savePayments();
    
    this.logToConsole('Payment Recorded', {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      totalPayments: this.payments.length
    }, 'info', `Payment ${payment.id} recorded with status: ${payment.status}`);
  }

  private updatePayment(payment: PaymentDetails): void {
    const index = this.payments.findIndex(p => p.id === payment.id);
    if (index !== -1) {
      this.payments[index] = payment;
      this.savePayments();
    }
  }

  public getPaymentHistory(): PaymentDetails[] {
    return [...this.payments].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getPaymentById(id: string): PaymentDetails | undefined {
    return this.payments.find(p => p.id === id);
  }

  private generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | null {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null;
  }

  public extractAmountFromMessage(message: string): number {
    // Extract amount from messages like "pay 100", "pay ₹500", "pay $50"
    const patterns = [
      /pay\s*₹?\s*(\d+(?:\.\d{2})?)/i,
      /pay\s*\$\s*(\d+(?:\.\d{2})?)/i,
      /pay\s*(\d+(?:\.\d{2})?)\s*(?:rupees?|rs\.?|inr)?/i
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        this.logToConsole('Amount Extracted from Message', {
          message: message.substring(0, 50),
          extractedAmount: amount,
          pattern: pattern.toString()
        }, 'info', `Extracted ₹${amount} from user message`);
        return amount;
      }
    }

    this.logToConsole('No Amount Found in Message', {
      message: message.substring(0, 50),
      defaultAmount: 100
    }, 'info', 'Using default amount of ₹100');
    
    return 100; // Default amount
  }
}

export const paymentService = new PaymentService();
export default PaymentService;