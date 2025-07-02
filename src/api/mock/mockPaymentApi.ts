import { PaymentRequest, PaymentResponse, PaymentDetails } from '../payment/types';

class MockPaymentApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('PAYMENT_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    this.logToConsole('processPayment Started', {
      amount: paymentRequest.amount,
      method: paymentRequest.method,
      currency: paymentRequest.currency,
      userId: paymentRequest.userId,
      maskedUpiId: paymentRequest.upiId?.replace(/(.{3}).*(@.*)/, '$1***$2')
    }, 'info', `Processing ₹${paymentRequest.amount} payment via ${paymentRequest.method}`);
    
    try {
      // In real implementation: POST /payments/process
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Simulate success/failure (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      const payment: PaymentDetails = {
        id: this.generatePaymentId(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        method: paymentRequest.method,
        upiId: paymentRequest.upiId,
        upiApp: paymentRequest.upiApp,
        status: isSuccess ? 'success' : 'failed',
        reason: paymentRequest.reason,
        timestamp: new Date(),
        transactionId: isSuccess ? this.generateTransactionId() : undefined,
        errorMessage: isSuccess ? undefined : 'Payment declined by bank. Please try again.'
      };

      const response: PaymentResponse = {
        success: isSuccess,
        payment,
        message: isSuccess ? 'Payment processed successfully' : 'Payment failed'
      };

      this.logToConsole('processPayment Success', {
        paymentId: payment.id,
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount
      }, isSuccess ? 'success' : 'error', `Payment ${isSuccess ? 'completed successfully' : 'failed'}`);
      
      return response;
    } catch (error) {
      this.logToConsole('processPayment Failed', {
        amount: paymentRequest.amount,
        method: paymentRequest.method,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Payment processing failed`);
      throw error;
    }
  }

  async getPaymentHistory(userId: string): Promise<PaymentDetails[]> {
    this.logToConsole('getPaymentHistory Started', { userId }, 'info', `Retrieving payment history for user ${userId}`);
    
    try {
      // In real implementation: GET /payments/history?userId={userId}
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock payment history
      const payments: PaymentDetails[] = [];

      this.logToConsole('getPaymentHistory Success', {
        userId,
        paymentCount: payments.length
      }, 'success', `Retrieved ${payments.length} payments for user ${userId}`);
      
      return payments;
    } catch (error) {
      this.logToConsole('getPaymentHistory Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve payment history for user ${userId}`);
      throw error;
    }
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    this.logToConsole('getPaymentDetails Started', { paymentId }, 'info', `Retrieving payment details for ${paymentId}`);
    
    try {
      // In real implementation: GET /payments/{paymentId}
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock payment details
      const payment: PaymentDetails = {
        id: paymentId,
        amount: 100,
        currency: 'INR',
        method: 'upi',
        status: 'success',
        reason: 'Chat Payment',
        timestamp: new Date(),
        transactionId: this.generateTransactionId()
      };

      this.logToConsole('getPaymentDetails Success', {
        paymentId,
        status: payment.status
      }, 'success', `Retrieved payment details for ${paymentId}`);
      
      return payment;
    } catch (error) {
      this.logToConsole('getPaymentDetails Failed', {
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve payment details for ${paymentId}`);
      throw error;
    }
  }

  private generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

export const mockPaymentApi = new MockPaymentApi();