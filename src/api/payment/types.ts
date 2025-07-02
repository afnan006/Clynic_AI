export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  method: 'upi' | 'card';
  upiId?: string;
  upiApp?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  transactionId?: string;
  reason: string;
  timestamp: Date;
  errorMessage?: string;
}

export interface UpiApp {
  id: string;
  name: string;
  icon: string;
  packageName: string;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  reason?: string;
  onPaymentComplete: (payment: PaymentDetails) => void;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  method: 'upi' | 'card';
  upiId?: string;
  upiApp?: string;
  reason: string;
  userId: string;
}

export interface PaymentResponse {
  success: boolean;
  payment: PaymentDetails;
  message: string;
}