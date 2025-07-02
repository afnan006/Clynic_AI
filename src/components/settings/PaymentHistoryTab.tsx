import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy,
  Download,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { PaymentDetails } from '../../types/payment';
import { paymentService } from '../../services/PaymentService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dropdown } from '../ui/Dropdown';
import { EmptyState } from '../ui/EmptyState';

interface PaymentHistoryTabProps {
  className?: string;
}

export function PaymentHistoryTab({ className = '' }: PaymentHistoryTabProps) {
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('PAYMENT_HISTORY', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const loadPayments = () => {
    setIsLoading(true);
    try {
      const paymentHistory = paymentService.getPaymentHistory();
      setPayments(paymentHistory);
      
      logToConsole('Payment History Loaded', {
        totalPayments: paymentHistory.length,
        successfulPayments: paymentHistory.filter(p => p.status === 'success').length,
        failedPayments: paymentHistory.filter(p => p.status === 'failed').length
      }, 'success');
    } catch (error) {
      logToConsole('Failed to Load Payment History', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.upiId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.method === methodFilter);
    }

    setFilteredPayments(filtered);
    
    logToConsole('Filters Applied', {
      searchTerm,
      statusFilter,
      methodFilter,
      originalCount: payments.length,
      filteredCount: filtered.length
    }, 'info');
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-error-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-warning-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-dark-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success-400 bg-success-500/10 border-success-500/20';
      case 'failed':
        return 'text-error-400 bg-error-500/10 border-error-500/20';
      case 'processing':
        return 'text-warning-400 bg-warning-500/10 border-warning-500/20';
      default:
        return 'text-dark-400 bg-dark-500/10 border-dark-500/20';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="w-4 h-4 text-primary-400" />;
      case 'card':
        return <CreditCard className="w-4 h-4 text-secondary-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-dark-400" />;
    }
  };

  const copyTransactionId = (transactionId: string) => {
    navigator.clipboard.writeText(transactionId);
    logToConsole('Transaction ID Copied', { transactionId }, 'info');
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Amount', 'Method', 'Status', 'Reason', 'Transaction ID', 'UPI ID'].join(','),
      ...filteredPayments.map(payment => [
        formatDate(payment.timestamp),
        payment.amount,
        payment.method.toUpperCase(),
        payment.status.toUpperCase(),
        payment.reason,
        payment.transactionId || '',
        payment.upiId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    logToConsole('Payment History Exported', {
      exportedCount: filteredPayments.length,
      format: 'CSV'
    }, 'success');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-white">Payment History</h2>
          <p className="text-dark-400 text-sm">
            View and manage your payment transactions
          </p>
        </div>
        
        {payments.length > 0 && (
          <Button
            onClick={exportPayments}
            variant="outline"
            size="sm"
            leftIcon={<Download />}
          >
            Export CSV
          </Button>
        )}
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard />}
          title="No Payment History"
          description="Your payment transactions will appear here once you make a payment."
        />
      ) : (
        <>
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search />}
                  size="sm"
                />
              </div>
              
              <Dropdown
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'success', label: 'Successful' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'processing', label: 'Processing' }
                ]}
                value={statusFilter}
                onSelect={setStatusFilter}
                size="sm"
              />
              
              <Dropdown
                options={[
                  { value: 'all', label: 'All Methods' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'card', label: 'Card' }
                ]}
                value={methodFilter}
                onSelect={setMethodFilter}
                size="sm"
              />
            </div>
          </Card>

          {/* Payment List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Method Icon */}
                        <div className="flex-shrink-0">
                          {getMethodIcon(payment.method)}
                        </div>
                        
                        {/* Payment Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-white font-medium truncate">
                              {payment.reason}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-dark-400">
                            <span>{formatDate(payment.timestamp)}</span>
                            {payment.upiId && (
                              <span className="truncate">
                                {payment.upiApp ? `${payment.upiApp}` : payment.upiId}
                              </span>
                            )}
                          </div>
                          
                          {payment.transactionId && (
                            <div className="flex items-center space-x-2 mt-2">
                              <code className="text-xs text-success-400 bg-success-500/10 px-2 py-1 rounded">
                                {payment.transactionId}
                              </code>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => copyTransactionId(payment.transactionId!)}
                                className="p-1"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          
                          {payment.errorMessage && (
                            <p className="text-error-400 text-xs mt-1">
                              {payment.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Amount and Status */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-white font-semibold">
                            {formatAmount(payment.amount, payment.currency)}
                          </p>
                          <p className="text-dark-400 text-xs">
                            {payment.method.toUpperCase()}
                          </p>
                        </div>
                        {getStatusIcon(payment.status)}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPayments.length === 0 && payments.length > 0 && (
            <EmptyState
              icon={<Search />}
              title="No Matching Payments"
              description="No payments match your current filters. Try adjusting your search criteria."
              action={{
                label: 'Clear Filters',
                onClick: () => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setMethodFilter('all');
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}