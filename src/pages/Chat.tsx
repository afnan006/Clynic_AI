import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Heart, User, LogOut, Settings, AlertCircle } from 'lucide-react';
import { MessageBubble } from '../components/chat/messages/MessageBubble';
import { TypingIndicator } from '../components/chat/messages/TypingIndicator';
import { ChatInput } from '../components/chat/ChatInput';
import { DoctorCarousel } from '../components/chat/doctors/DoctorCarousel';
import { MedicineCarousel } from '../components/chat/medicines/MedicineCarousel';
import { LocationTab } from '../components/chat/hospitals/LocationTab';
import { InteractiveQuestion } from '../components/chat/questions/InteractiveQuestion';
import { NotificationDisplay } from '../components/notifications/NotificationDisplay';
import { VoiceAnimationModal } from '../components/chat/VoiceAnimationModal';
import { PaymentModal } from '../components/payment/PaymentModal';
import { SettingsPage } from './SettingsPage';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Message, AttachmentPreview } from '../types';
import { PaymentDetails } from '../api/payment/types';
import { chatApi } from '../api/chat/chatApi';
import { useAuth } from '../hooks/useAuth.tsx';
import { useResponsive } from '../hooks/useResponsive';
import { base64ToArrayBuffer, decrypt, encrypt, generateIv, arrayBufferToBase64 } from '../utils/encryption';
import { notificationService } from '../services/NotificationService';
import { paymentService } from '../services/PaymentService';
import { DateSeparator } from '../components/chat/messages/DateSeparator';

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<{title: string, message: string} | null>(null);
  
  // Voice modal states
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(100);
  const [paymentReason, setPaymentReason] = useState('Chat Payment');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { authState, signOut, getEncryptionKey, reinitializeEncryption } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const shouldReduceMotion = useReducedMotion();

  const logToConsole = useCallback((action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('CHAT', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [shouldReduceMotion]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

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

  // Memoize encryption status for the top bar
  const encryptionStatus = useMemo(() => {
    const hasUser = !!authState.user;
    const hasKey = !!getEncryptionKey();
    const isKeyDerived = authState.isKeyDerived;
    const isLoading = authState.isLoading;
    
    return {
      hasUser,
      hasKey,
      isKeyDerived,
      isLoading,
      canEncrypt: hasUser && hasKey && isKeyDerived && !isLoading,
      statusText: hasUser && hasKey && isKeyDerived && !isLoading
        ? '🔒 End-to-End Encrypted' 
        : hasUser && isLoading
          ? '⚠️ Encryption Initializing...' 
          : hasUser
            ? '❌ Encryption Failed'
            : '🔓 Demo Mode'
    };
  }, [authState.user, authState.isKeyDerived, authState.isLoading, getEncryptionKey]);

  // Memoize welcome message to prevent recreation
  const welcomeMessage = useMemo((): Message => ({
    id: 'welcome',
    userId: authState.user?.id || 'demo',
    sender: 'ai',
    message: `Hello${authState.user?.name ? ` ${authState.user.name}` : ''}! I'm your AI healthcare assistant. I'm here to help you with medical questions, find doctors, locate hospitals, and provide health recommendations. ${authState.user && authState.isKeyDerived && !authState.isLoading ? 'Your messages are fully encrypted for maximum privacy.' : ''} How can I assist you today?`,
    messageType: 'text',
    timestamp: new Date(),
  }), [authState.user, authState.isKeyDerived, authState.isLoading]);

  useEffect(() => {
    // Enable verbose logging in NotificationService for debugging
    notificationService.setVerboseLogging(true);
    
    logToConsole('💬 Chat System Initialized', {
      userId: authState.user?.id,
      isAuthenticated: !!authState.user,
      hasEncryptionKey: !!getEncryptionKey(),
      isKeyDerived: authState.isKeyDerived,
      isLoading: authState.isLoading,
      encryptionStatus: authState.user && authState.isKeyDerived && !authState.isLoading ? 'READY' : 'DEMO_MODE',
      viewport: { isMobile, isTablet }
    }, 'info', `Chat system started for ${authState.user ? 'authenticated user' : 'demo user'} with ${authState.user && authState.isKeyDerived && !authState.isLoading ? 'full encryption' : 'demo mode'}`);

    // Send welcome message
    setMessages([welcomeMessage]);

    logToConsole('✅ Welcome Message Sent', {
      messageId: welcomeMessage.id,
      hasUserName: !!authState.user?.name,
      encryptionMentioned: authState.user && authState.isKeyDerived && !authState.isLoading
    }, 'success', `Welcome message displayed to ${authState.user?.name || 'user'}`);
  }, [authState.user, authState.isKeyDerived, authState.isLoading, welcomeMessage, getEncryptionKey, logToConsole, isMobile, isTablet]);

  // Add demo notifications only once when the component mounts
  useEffect(() => {
    if (authState.user) {
      // Add some demo notifications after a short delay
      const notificationTimeout = setTimeout(() => {
        notificationService.addMedicineReminder('Metformin', '500mg twice daily');
        
        const interactiveTimeout = setTimeout(() => {
          notificationService.addInteractiveMessage(
            'How are you feeling today? Any changes in your symptoms?',
            ['I feel great!', 'Same as usual', 'A bit worse', 'Much better'],
            true
          );
        }, 3000);

        const appointmentTimeout = setTimeout(() => {
          notificationService.addAppointmentConfirmation(
            'Sarah Johnson',
            new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            'apt_123'
          );
        }, 6000);

        return () => {
          clearTimeout(interactiveTimeout);
          clearTimeout(appointmentTimeout);
        };
      }, 2000);

      return () => clearTimeout(notificationTimeout);
    }
  }, []); // Empty dependency array ensures this runs only once

  const handleSendMessage = useCallback(async (messageInput: { encryptedData: string; iv: string; originalMessage: string; attachedFiles?: AttachmentPreview[] }) => {
    const startTime = performance.now();
    
    // Verify encryption is available
    if (!encryptionStatus.canEncrypt) {
      logToConsole('🔒 ENCRYPTION REQUIRED', {
        reason: !authState.user ? 'No user authenticated' : 'Encryption key not available',
        securityBlock: true
      }, 'error', 'Message blocked: End-to-end encryption is required for all messages');
      
      // Show security alert
      setSecurityAlert({
        title: 'Encryption Required',
        message: 'Your message could not be sent because end-to-end encryption is required. Please sign in again to re-establish secure encryption.'
      });
      
      return;
    }

    // Create user message for display - we'll use the original message
    const messageText = messageInput.originalMessage;

    const userMessage: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'user',
      message: messageText,
      messageType: 'text',
      timestamp: new Date(),
      attachments: messageInput.attachedFiles
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Get the client's encryption key to pass to the API
      const clientEncryptionKey = getEncryptionKey()!;

      // Log key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      logToConsole('🔑 Using Client Key for API Call', {
        keyId: keyId,
        keyType: clientEncryptionKey.type,
        keyAlgorithm: clientEncryptionKey.algorithm,
        keyUsages: clientEncryptionKey.usages
      }, 'info', `Using encryption key ${keyId} for API call`);

      // Send encrypted message to API
      const apiCallStart = performance.now();
      const response = await chatApi.sendMessage(messageInput, clientEncryptionKey);
      const apiCallTime = performance.now() - apiCallStart;

      logToConsole('🌐 STEP 7: Server Response Received', {
        responseId: response.id,
        apiLatencyMs: apiCallTime.toFixed(2),
        apiLatencySeconds: (apiCallTime / 1000).toFixed(3),
        hasEncryptedResponse: !!(response.encryptedData && response.iv),
        responseType: response.encryptedData ? 'encrypted' : 'plain',
        messageType: response.messageType,
        hasQuestionData: !!response.questionData,
        serverProcessingComplete: true
      }, 'success', `Server responded in ${apiCallTime.toFixed(0)}ms with ${response.encryptedData ? 'an encrypted' : 'a plain text'} message`);

      let finalMessage: string;

      // Handle encrypted response
      if (response.encryptedData && response.iv && getEncryptionKey()) {
        logToConsole('🔓 STEP 8: Starting Response Decryption', {
          encryptedDataLength: response.encryptedData.length,
          ivLength: response.iv.length,
          hasDecryptionKey: !!getEncryptionKey(),
          algorithm: 'AES-256-GCM'
        }, 'info', `Decrypting server response that looks like "${response.encryptedData.substring(0, 20)}..." back to readable text`);

        try {
          const decryptionStart = performance.now();
          
          // Convert Base64 back to ArrayBuffer
          const base64ConversionStart = performance.now();
          const encryptedDataBuffer = base64ToArrayBuffer(response.encryptedData);
          const ivBuffer = new Uint8Array(base64ToArrayBuffer(response.iv));
          const base64ConversionTime = performance.now() - base64ConversionStart;

          logToConsole('📦 STEP 8a: Base64 Decoding Complete', {
            encryptedDataBufferLength: encryptedDataBuffer.byteLength,
            ivBufferLength: ivBuffer.length,
            decodingTimeMs: base64ConversionTime.toFixed(2)
          }, 'success', `Converted encrypted data from transmission format in ${base64ConversionTime.toFixed(0)}ms`);

          // Get client encryption key for decryption
          const clientKey = getEncryptionKey()!;
          const keyId = (clientKey as any).keyId || 'unknown_key';
          
          // Log detailed information about the decryption attempt
          logToConsole('🔑 STEP 8a-1: Preparing for Decryption', {
            keyId: keyId,
            keyType: clientKey.type,
            keyAlgorithm: clientKey.algorithm,
            keyUsages: clientKey.usages,
            ivLength: ivBuffer.length,
            ivFirstBytes: Array.from(ivBuffer.slice(0, 4)),
            encryptedDataLength: encryptedDataBuffer.byteLength,
            encryptedFirstBytes: Array.from(new Uint8Array(encryptedDataBuffer.slice(0, 16)))
          }, 'info', `Preparing to decrypt response using key ${keyId}`);

          // Decrypt the response
          const actualDecryptionStart = performance.now();
          finalMessage = await decrypt(encryptedDataBuffer, clientKey, ivBuffer);
          const actualDecryptionTime = performance.now() - actualDecryptionStart;
          const totalDecryptionTime = performance.now() - decryptionStart;

          logToConsole('🔓 STEP 8b: Response Decryption Complete', {
            encryptedLength: encryptedDataBuffer.byteLength,
            decryptedLength: finalMessage.length,
            decryptedMessage: finalMessage.substring(0, 100) + (finalMessage.length > 100 ? '...' : ''),
            actualDecryptionTimeMs: actualDecryptionTime.toFixed(2),
            totalDecryptionTimeMs: totalDecryptionTime.toFixed(2),
            algorithm: 'AES-256-GCM',
            securityVerified: true,
            keyId: keyId
          }, 'success', `Successfully decrypted server response in ${totalDecryptionTime.toFixed(0)}ms using key ${keyId}. The message says: "${finalMessage.substring(0, 50)}${finalMessage.length > 50 ? '...' : ''}"`);

        } catch (decryptionError) {
          logToConsole('❌ CRITICAL: Response Decryption Failed', {
            error: decryptionError instanceof Error ? decryptionError.message : 'Unknown error',
            securityAlert: true,
            encryptedDataLength: response.encryptedData.length,
            ivLength: response.iv.length,
            keyAvailable: !!getEncryptionKey(),
            keyId: getEncryptionKey() ? (getEncryptionKey() as any).keyId || 'unknown_key' : 'no_key'
          }, 'error', `Failed to decrypt server response - security issue detected`);
          
          // Show security alert
          setSecurityAlert({
            title: 'Decryption Failed',
            message: 'Unable to decrypt the response from the server. This could indicate a security issue. Please try again or contact support if the issue persists.'
          });
          
          throw new Error('Failed to decrypt response: ' + (decryptionError instanceof Error ? decryptionError.message : 'Unknown error'));
        }
      } else {
        // This should never happen in the enhanced security implementation
        logToConsole('❌ CRITICAL: Missing Encrypted Response', {
          hasEncryptedData: !!response.encryptedData,
          hasIv: !!response.iv,
          hasKey: !!getEncryptionKey(),
          securityAlert: true
        }, 'error', `Server sent an improperly encrypted response - security issue detected`);
        
        // Show security alert
        setSecurityAlert({
          title: 'Security Issue Detected',
          message: 'The server response was not properly encrypted. This could indicate a security issue. Please try again or contact support if the issue persists.'
        });
        
        throw new Error('Server response missing required encryption data');
      }

      // Voice modal: Set AI speaking state
      if (isVoiceModalOpen) {
        setAiSpeaking(true);
        setCurrentSubtitle(finalMessage);
        
        // Stop AI speaking after message length-based delay
        const speakingDuration = Math.max(2000, finalMessage.length * 50); // 50ms per character, min 2s
        setTimeout(() => {
          setAiSpeaking(false);
          setCurrentSubtitle('');
        }, speakingDuration);
      }

      const totalTime = performance.now() - startTime;

      logToConsole('✅ STEP 9: Message Flow Complete - User Display Ready', {
        finalMessage: finalMessage.substring(0, 100) + (finalMessage.length > 100 ? '...' : ''),
        messageLength: finalMessage.length,
        totalLatencyMs: totalTime.toFixed(2),
        totalLatencySeconds: (totalTime / 1000).toFixed(3),
        encryptionRoundTrip: true,
        securityStatus: 'FULLY_ENCRYPTED',
        performanceGrade: totalTime < 1000 ? 'EXCELLENT' : totalTime < 2000 ? 'GOOD' : 'ACCEPTABLE',
        messageType: response.messageType,
        hasQuestionData: !!response.questionData
      }, 'success', `Complete message exchange took ${(totalTime / 1000).toFixed(1)} seconds with full encryption - AI response is ready to display`);

      // Create AI message with decrypted content
      const aiMessage: Message = {
        ...response,
        message: finalMessage,
        userId: authState.user?.id || 'demo',
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check for payment request
      if (response.paymentRequest) {
        logToConsole('Payment Request Detected', {
          amount: response.paymentRequest.amount,
          reason: response.paymentRequest.reason
        }, 'info', `Opening payment modal for ₹${response.paymentRequest.amount}`);
        
        setPaymentAmount(response.paymentRequest.amount);
        setPaymentReason(response.paymentRequest.reason || 'Chat Payment');
        setShowPaymentModal(true);
      }

      // Add component message if needed
      if (response.componentType === 'doctors') {
        const componentMessage: Message = {
          id: `component_${Date.now()}`,
          userId: authState.user?.id || 'demo',
          sender: 'ai',
          message: '',
          messageType: 'component',
          componentType: 'doctors',
          componentProps: {
            onBookConsultation: handleBookConsultation
          },
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, componentMessage]);
      } else if (response.showMedicines || response.componentType === 'medicines') {
        const componentMessage: Message = {
          id: `component_${Date.now()}`,
          userId: authState.user?.id || 'demo',
          sender: 'ai',
          message: '',
          messageType: 'component',
          componentType: 'medicines',
          componentProps: {
            onAddToCart: handleAddToCart,
            onShowInfo: handleShowMedicineInfo
          },
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, componentMessage]);
      } else if (response.componentType === 'location') {
        const componentMessage: Message = {
          id: `component_${Date.now()}`,
          userId: authState.user?.id || 'demo',
          sender: 'ai',
          message: '',
          messageType: 'component',
          componentType: 'location',
          componentProps: {
            onGetDirections: handleGetDirections,
            onCall: handleCall
          },
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, componentMessage]);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logToConsole('❌ CRITICAL: Message Processing Failed', {
        error: errorMessage,
        totalLatencyMs: (performance.now() - startTime).toFixed(2),
        securityIssue: true
      }, 'error', `Message processing failed - ${errorMessage}`);
      
      const errorNotification: Message = {
        id: Date.now().toString(),
        userId: authState.user?.id || 'demo',
        sender: 'ai',
        message: 'I apologize, but there was a security issue processing your message. This has been logged for investigation. Please try again or contact support if the issue persists.',
        messageType: 'text',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorNotification]);
      
      // If no security alert is already shown, show one
      if (!securityAlert) {
        setSecurityAlert({
          title: 'Security Issue Detected',
          message: 'There was a problem processing your message securely. This has been logged for investigation. Please try again or contact support if the issue persists.'
        });
      }
    } finally {
      setIsTyping(false);
    }
  }, [authState.user, getEncryptionKey, logToConsole, isVoiceModalOpen, encryptionStatus.canEncrypt, securityAlert]);

  const handleQuestionAnswer = useCallback((questionId: string, answer: string | string[]) => {
    logToConsole('Question Answered', {
      questionId,
      answerType: Array.isArray(answer) ? 'multiple_choice' : 'single_choice',
      answerValue: Array.isArray(answer) ? answer.join(', ') : answer
    }, 'info', `User answered question with: ${Array.isArray(answer) ? answer.join(', ') : answer}`);

    // For the answer, we need to encrypt it before sending
    const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
    
    // We need to encrypt this answer before sending
    const encryptAndSendAnswer = async () => {
      if (!encryptionStatus.canEncrypt) {
        logToConsole('🔒 ENCRYPTION REQUIRED FOR ANSWER', {
          securityBlock: true
        }, 'error', 'Answer blocked: End-to-end encryption is required');
        
        setSecurityAlert({
          title: 'Encryption Required',
          message: 'Your answer could not be sent because end-to-end encryption is required. Please sign in again to re-establish secure encryption.'
        });
        
        return;
      }
      
      try {
        const encryptionKey = getEncryptionKey()!;
        const iv = await generateIv();
        const { encryptedData } = await encrypt(answerText, encryptionKey, iv);
        
        const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
        const ivBase64 = arrayBufferToBase64(iv.buffer);
        
        // Send the encrypted answer
        await handleSendMessage({
          encryptedData: encryptedDataBase64,
          iv: ivBase64,
          originalMessage: answerText
        });
      } catch (error) {
        logToConsole('❌ ANSWER ENCRYPTION FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error',
          securityIssue: true
        }, 'error', 'Failed to encrypt answer');
        
        setSecurityAlert({
          title: 'Encryption Failed',
          message: 'Your answer could not be encrypted securely. Please try again or contact support if the issue persists.'
        });
      }
    };
    
    encryptAndSendAnswer();
  }, [handleSendMessage, logToConsole, encryptionStatus.canEncrypt, getEncryptionKey]);

  const handlePaymentComplete = useCallback((payment: PaymentDetails) => {
    logToConsole('💳 Payment Completed in Chat', {
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method
    }, 'success', `Payment of ₹${payment.amount} completed with status: ${payment.status}`);

    // Add a success message to chat
    const paymentMessage: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'ai',
      message: payment.status === 'success' 
        ? `Great! Your payment of ₹${payment.amount} has been processed successfully. Transaction ID: ${payment.transactionId}`
        : `I'm sorry, but your payment of ₹${payment.amount} could not be processed. Please try again.`,
      messageType: 'text',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, paymentMessage]);
    setShowPaymentModal(false);
  }, [authState.user, logToConsole]);

  const handleMicClick = useCallback(() => {
    if (!encryptionStatus.canEncrypt) {
      logToConsole('🔒 ENCRYPTION REQUIRED FOR VOICE', {
        securityBlock: true
      }, 'error', 'Voice assistant blocked: End-to-end encryption is required');
      
      setSecurityAlert({
        title: 'Encryption Required',
        message: 'Voice assistant requires end-to-end encryption. Please sign in to use this feature.'
      });
      
      return;
    }
    
    logToConsole('Mic Button Clicked', {}, 'info', 'User clicked the microphone button to open voice assistant');
    setIsVoiceModalOpen(true);
  }, [logToConsole, encryptionStatus.canEncrypt]);

  const handleBookConsultation = useCallback((doctorId: string) => {
    logToConsole('Doctor Consultation Booked', { doctorId }, 'info', `User clicked to book a consultation with doctor ${doctorId}`);
    
    const message: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'ai',
      message: `Great choice! I'll help you book a consultation with this doctor. Please let me know your preferred date and time.`,
      messageType: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, [authState.user, logToConsole]);

  const handleAddToCart = useCallback((medicineId: string) => {
    logToConsole('Medicine Added to Cart', { medicineId }, 'info', `User added medicine ${medicineId} to their cart`);
    
    const message: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'ai',
      message: `Medicine added to your cart! Would you like to proceed with the order or need more information about this medication?`,
      messageType: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, [authState.user, logToConsole]);

  const handleShowMedicineInfo = useCallback((medicineId: string) => {
    logToConsole('Medicine Info Requested', { medicineId }, 'info', `User requested detailed information about medicine ${medicineId}`);
    
    const message: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'ai',
      message: `Here's detailed information about this medication including dosage, side effects, and precautions. Always consult with your doctor before starting any new medication.`,
      messageType: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, [authState.user, logToConsole]);

  const handleGetDirections = useCallback((hospitalId: string) => {
    logToConsole('Hospital Directions Requested', { hospitalId }, 'info', `User requested directions to hospital ${hospitalId}`);
    
    const message: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'ai',
      message: `Opening directions to the hospital. The estimated travel time and best route will be shown in your maps application.`,
      messageType: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, [authState.user, logToConsole]);

  const handleCall = useCallback((hospitalId: string) => {
    logToConsole('Hospital Call Initiated', { hospitalId }, 'info', `User initiated a call to hospital ${hospitalId}`);
    
    const message: Message = {
      id: Date.now().toString(),
      userId: authState.user?.id || 'demo',
      sender: 'ai',
      message: `Initiating call to the hospital. You can now speak directly with their reception desk.`,
      messageType: 'text',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  }, [authState.user, logToConsole]);

  const handleSignOut = useCallback(() => {
    logToConsole('Sign Out Initiated', { userId: authState.user?.id }, 'info', `User ${authState.user?.name || 'demo user'} signed out of the application`);
    signOut();
  }, [authState.user, signOut, logToConsole]);

  const handleBackToLogin = useCallback(() => {
    logToConsole('Back to Login Clicked', {}, 'info', 'User clicked to go back to the login page');
    window.location.href = '/';
  }, [logToConsole]);

  const handleRetryEncryption = useCallback(async () => {
    logToConsole('Retry Encryption Clicked', { userId: authState.user?.id }, 'info', `User clicked to retry encryption setup for their account`);
    await reinitializeEncryption();
  }, [authState.user, reinitializeEncryption, logToConsole]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  // Function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Render messages with date separators
  const renderMessagesWithDateSeparators = () => {
    if (messages.length === 0) {
      return (
        <EmptyState
          icon={<Heart />}
          title="Welcome to your AI Healthcare Assistant"
          description="Start a conversation to get personalized health recommendations, find doctors, and more."
        />
      );
    }

    const result: JSX.Element[] = [];
    let lastMessageDate: Date | null = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp);
      
      // Add date separator if this is the first message or if the date is different from the previous message
      if (!lastMessageDate || !isSameDay(messageDate, lastMessageDate)) {
        result.push(
          <DateSeparator key={`date-${messageDate.toISOString()}`} date={messageDate} />
        );
      }
      
      // Add the message
      result.push(
        <div key={message.id}>
          {message.messageType === 'text' && (
            <MessageBubble message={message} />
          )}
          {message.messageType === 'question' && message.questionData && (
            <InteractiveQuestion
              questionData={message.questionData}
              onAnswer={(answer) => handleQuestionAnswer(message.id, answer)}
            />
          )}
          {message.messageType === 'component' && message.componentType === 'doctors' && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DoctorCarousel onBookConsultation={handleBookConsultation} />
            </motion.div>
          )}
          {message.messageType === 'component' && message.componentType === 'medicines' && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MedicineCarousel onAddToCart={handleAddToCart} onShowInfo={handleShowMedicineInfo} />
            </motion.div>
          )}
          {message.messageType === 'component' && message.componentType === 'location' && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LocationTab onGetDirections={handleGetDirections} onCall={handleCall} />
            </motion.div>
          )}
        </div>
      );
      
      // Update lastMessageDate
      lastMessageDate = messageDate;
    });

    // Add typing indicator if needed
    if (isTyping) {
      result.push(<TypingIndicator key="typing" />);
    }

    return result;
  };

  return (
    <div className="h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex flex-col overflow-hidden">
      {/* Encryption Status Bar - Fixed at top */}
      <motion.div
        initial={shouldReduceMotion ? {} : { y: -50, opacity: 0 }}
        animate={shouldReduceMotion ? {} : { y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
      >
        <div className="container mx-auto max-w-4xl px-4 py-2 flex items-center justify-between">
          {/* Left - App branding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-glow-primary">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-semibold text-sm">{import.meta.env.VITE_APP_NAME || 'Clynic AI'}</h1>
            </div>
          </div>

          {/* Center - Encryption Status */}
          <div className="flex-1 flex justify-center">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              encryptionStatus.canEncrypt
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : encryptionStatus.isLoading
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : encryptionStatus.hasUser && !encryptionStatus.canEncrypt && !encryptionStatus.isLoading
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer hover:bg-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}
            onClick={encryptionStatus.hasUser && !encryptionStatus.canEncrypt && !encryptionStatus.isLoading ? handleRetryEncryption : undefined}
            title={encryptionStatus.hasUser && !encryptionStatus.canEncrypt && !encryptionStatus.isLoading ? 'Click to retry encryption setup' : undefined}
            >
              {encryptionStatus.statusText}
            </span>
          </div>
          
          {/* Right - Notifications and User Menu */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <NotificationDisplay />
            
            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <User className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={shouldReduceMotion ? {} : { opacity: 0, y: -10, scale: 0.95 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-soft-xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-3 border-b border-dark-700">
                      <p className="text-white text-sm font-medium truncate">
                        {authState.user?.name || authState.user?.email || 'Demo User'}
                      </p>
                      <p className="text-dark-400 text-xs truncate">
                        {authState.user?.email || 'demo@example.com'}
                      </p>
                      {authState.user && authState.isKeyDerived && !authState.isLoading && (
                        <p className="text-success-400 text-xs mt-1">🔒 Encrypted</p>
                      )}
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => {
                          setShowSettings(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      {authState.user ? (
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-error-400 hover:text-error-300 hover:bg-error-500/10 rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-error-500/50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      ) : (
                        <button 
                          onClick={handleBackToLogin}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Back to Login</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Alert */}
      <AnimatePresence>
        {securityAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 z-40 px-4 py-2"
          >
            <div className="container mx-auto max-w-4xl">
              <Alert
                variant="error"
                title={securityAlert.title}
                description={securityAlert.message}
                icon={<AlertCircle />}
                dismissible
                onDismiss={() => setSecurityAlert(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Access Banner */}
      {!authState.user && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="bg-primary-500/10 border-b border-primary-500/20 px-4 py-2 mt-12"
        >
          <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <p className="text-primary-400 text-sm text-center sm:text-left">
              🚀 You're using demo mode. Sign in for full features and data encryption.
            </p>
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              size="sm"
              className="border-primary-500/30 text-primary-400 hover:bg-primary-500/10 shrink-0"
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      )}

      {/* Messages - Apply blur when voice modal is open */}
      <main 
        className={`flex-1 overflow-y-auto scrollbar-hide px-4 py-6 pb-24 pt-16 transition-all duration-300 ${
          isVoiceModalOpen ? 'blur-md' : ''
        } ${securityAlert ? 'mt-12' : ''}`} 
        role="main"
      >
        <div className="container mx-auto max-w-4xl">
          <AnimatePresence>
            {renderMessagesWithDateSeparators()}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        onMicClick={handleMicClick}
        disabled={isTyping} 
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentAmount}
        reason={paymentReason}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Voice Animation Modal */}
      <VoiceAnimationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        userSpeaking={userSpeaking}
        aiSpeaking={aiSpeaking}
        currentSubtitle={currentSubtitle}
        showSubtitles={showSubtitles}
        onToggleSubtitles={() => setShowSubtitles(!showSubtitles)}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPage onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}