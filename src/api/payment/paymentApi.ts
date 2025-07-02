import { axiosClient } from '../axiosInstance';
import { PaymentRequest, PaymentResponse, PaymentDetails } from './types';
import { USE_MOCK_API, API_ENDPOINTS, formatEndpoint } from '../config';
import { mockPaymentApi } from '../mock/mockPaymentApi';

class PaymentApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('PAYMENT_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockPaymentApi.processPayment(paymentRequest);
    }

    this.logToConsole('processPayment Started', {
      amount: paymentRequest.amount,
      method: paymentRequest.method,
      currency: paymentRequest.currency,
      userId: paymentRequest.userId,
      maskedUpiId: paymentRequest.upiId?.replace(/(.{3}).*(@.*)/, '$1***$2')
    }, 'info', `Processing ₹${paymentRequest.amount} payment via ${paymentRequest.method}`);
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.PAYMENT.PROCESS, paymentRequest);
      
      this.logToConsole('processPayment Success', {
        paymentId: response.data.payment.id,
        status: response.data.payment.status,
        transactionId: response.data.payment.transactionId,
        amount: response.data.payment.amount
      }, response.data.success ? 'success' : 'error', `Payment ${response.data.success ? 'completed successfully' : 'failed'}`);
      
      return response.data;
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
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockPaymentApi.getPaymentHistory(userId);
    }

    this.logToConsole('getPaymentHistory Started', { userId }, 'info', `Retrieving payment history for user ${userId}`);
    
    try {
      const response = await axiosClient.get(`${API_ENDPOINTS.PAYMENT.HISTORY}?userId=${userId}`);
      
      this.logToConsole('getPaymentHistory Success', {
        userId,
        paymentCount: response.data.length
      }, 'success', `Retrieved ${response.data.length} payments for user ${userId}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('getPaymentHistory Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve payment history for user ${userId}`);
      throw error;
    }
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentDetails> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockPaymentApi.getPaymentDetails(paymentId);
    }

    this.logToConsole('getPaymentDetails Started', { paymentId }, 'info', `Retrieving payment details for ${paymentId}`);
    
    try {
      const response = await axiosClient.get(formatEndpoint(API_ENDPOINTS.PAYMENT.DETAILS, { id: paymentId }));
      
      this.logToConsole('getPaymentDetails Success', {
        paymentId,
        status: response.data.status
      }, 'success', `Retrieved payment details for ${paymentId}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('getPaymentDetails Failed', {
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve payment details for ${paymentId}`);
      throw error;
    }
  }
}

export const paymentApi = new PaymentApi();