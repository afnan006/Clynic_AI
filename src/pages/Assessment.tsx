import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { VerticalProgressBar } from '../components/assessment/VerticalProgressBar';
import { NameQuestion } from '../components/assessment/questions/NameQuestion';
import { AgeQuestion } from '../components/assessment/questions/AgeQuestion';
import { PhoneQuestion } from '../components/assessment/questions/PhoneQuestion';
import { DiabetesQuestion } from '../components/assessment/questions/DiabetesQuestion';
import { BloodPressureQuestion } from '../components/assessment/questions/BloodPressureQuestion';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth.tsx';
import { assessmentApi } from '../api/assessment/assessmentApi';
import { generateIv, encrypt, arrayBufferToBase64 } from '../utils/encryption';
import { Helmet } from 'react-helmet-async';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';

interface AssessmentData {
  name: string;
  age: number;
  phone: string;
  hasDiabetes: boolean;
  hasBloodPressure: boolean;
}

export function Assessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentData, setAssessmentData] = useState<Partial<AssessmentData>>({});
  const [submissionError, setSubmissionError] = useState<string>('');
  const [securityAlert, setSecurityAlert] = useState<string>('');
  const { updateUser, authState, getEncryptionKey, signOut } = useAuth();
  const navigate = useNavigate();

  // Total number of steps (5 questions + 1 submission)
  const totalSteps = 6;

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ASSESSMENT', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  // Check if user is authenticated but encryption key is not available
  if (authState.user && !authState.isKeyDerived) {
    return (
      <div className="h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground variant="assessment" intensity="subtle" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md relative z-10"
        >
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🔐</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Sign In Required</h2>
            <p className="text-dark-400">
              Your session has expired and we need to re-establish your encryption key to keep your data secure.
            </p>
            <p className="text-sm text-yellow-400">
              Please sign in again to continue with your assessment.
            </p>
          </div>

          <Button
            onClick={() => {
              signOut();
              navigate('/auth');
            }}
            className="w-full"
          >
            Sign In Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Listen for security alerts
  useEffect(() => {
    const handleSecurityAlert = (event: CustomEvent) => {
      const { message } = event.detail;
      setSecurityAlert(message);
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setSecurityAlert('');
      }, 10000);
    };

    window.addEventListener('securityAlert', handleSecurityAlert as EventListener);
    
    return () => {
      window.removeEventListener('securityAlert', handleSecurityAlert as EventListener);
    };
  }, []);

  const handleValueChange = (key: keyof AssessmentData, value: any) => {
    const newData = { ...assessmentData, [key]: value };
    setAssessmentData(newData);

    logToConsole('Assessment Field Updated', {
      field: key,
      hasValue: !!value,
      totalFields: Object.keys(newData).length,
      completedFields: Object.values(newData).filter(v => v !== undefined && v !== '').length
    }, 'info');
  };

  const isCurrentQuestionValid = () => {
    switch (currentQuestionIndex) {
      case 0: // Name
        return assessmentData.name && assessmentData.name.trim().length >= 2;
      case 1: // Age
        return assessmentData.age && assessmentData.age >= 1 && assessmentData.age <= 120;
      case 2: // Phone
        return assessmentData.phone && assessmentData.phone.length >= 10;
      case 3: // Diabetes
        return assessmentData.hasDiabetes !== undefined;
      case 4: // Blood Pressure
        return assessmentData.hasBloodPressure !== undefined;
      case 5: // Submission
        return true;
      default:
        return false;
    }
  };

  const isAssessmentComplete = () => {
    return assessmentData.name && 
           assessmentData.age && 
           assessmentData.phone && 
           assessmentData.hasDiabetes !== undefined && 
           assessmentData.hasBloodPressure !== undefined;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalSteps - 1) {
      if (isCurrentQuestionValid()) {
        setCurrentQuestionIndex(prev => prev + 1);
        logToConsole('Advanced to Next Question', {
          fromStep: currentQuestionIndex + 1,
          toStep: currentQuestionIndex + 2,
          totalSteps
        }, 'info');
      }
    } else if (currentQuestionIndex === totalSteps - 1 && isAssessmentComplete()) {
      // Final submission
      submitEncryptedAssessment();
    }
  };

  // Listen for Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !isSubmitting) {
        event.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestionIndex, assessmentData, isSubmitting]);

  const submitEncryptedAssessment = async () => {
    if (!isAssessmentComplete()) {
      setSubmissionError('Please complete all questions before submitting.');
      return;
    }

    // Verify user is authenticated and encryption is available
    if (!authState.user) {
      setSubmissionError('You must be signed in to submit an assessment.');
      logToConsole('Assessment Submission Blocked', {
        reason: 'No authenticated user',
        securityBlock: true
      }, 'error');
      return;
    }

    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      setSubmissionError('Encryption key not available. Please sign in again to enable data encryption.');
      logToConsole('Assessment Submission Blocked', {
        reason: 'No encryption key available',
        securityBlock: true
      }, 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');
    
    const data = assessmentData as AssessmentData;
    
    logToConsole('Assessment Submission Started', {
      dataFields: Object.keys(data),
      hasAllFields: Object.keys(data).length === 5,
      authUser: !!authState.user,
      hasEncryptionKey: !!encryptionKey
    }, 'info');

    try {
      // Convert assessment data to JSON string
      const stringifiedData = JSON.stringify(data);
      
      logToConsole('Data Stringified', {
        originalDataSize: stringifiedData.length,
        dataPreview: stringifiedData.substring(0, 100) + '...'
      }, 'info');

      // Generate IV for encryption
      const iv = await generateIv();
      
      logToConsole('IV Generated', {
        ivLength: iv.length,
        ivBase64: arrayBufferToBase64(iv.buffer)
      }, 'success');

      // Encrypt the assessment data
      const { encryptedData } = await encrypt(stringifiedData, encryptionKey, iv);
      
      logToConsole('Assessment Data Encrypted', {
        originalSize: stringifiedData.length,
        encryptedSize: encryptedData.byteLength,
        compressionRatio: (encryptedData.byteLength / stringifiedData.length).toFixed(2)
      }, 'success');

      // Convert encrypted data and IV to Base64 for transmission
      const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
      const ivBase64 = arrayBufferToBase64(iv.buffer);

      logToConsole('Data Prepared for Transmission', {
        encryptedDataBase64Length: encryptedDataBase64.length,
        ivBase64Length: ivBase64.length,
        totalPayloadSize: encryptedDataBase64.length + ivBase64.length
      }, 'info');

      // Submit encrypted data to API
      const encryptedPayload = {
        encryptedData: encryptedDataBase64,
        iv: ivBase64,
        userId: authState.user.id,
        timestamp: new Date().toISOString(),
        encrypted: true
      };

      logToConsole('Submitting Encrypted Assessment', {
        payloadKeys: Object.keys(encryptedPayload),
        userId: authState.user.id,
        encrypted: true
      }, 'info');

      const result = await assessmentApi.submitAssessment(encryptedPayload);
      
      logToConsole('Assessment Submission Success', {
        userId: authState.user.id,
        encryptedDataSize: encryptedDataBase64.length,
        result
      }, 'success');

      // Update user as onboarded
      const updatedUser = { ...authState.user, isOnboarded: true };
      updateUser(updatedUser);
      
      logToConsole('User Onboarded', {
        userId: updatedUser.id,
        isOnboarded: updatedUser.isOnboarded
      }, 'success');
      
      // Navigate to chat
      logToConsole('Navigating to Chat', {}, 'info');
      navigate('/chat');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      logToConsole('Assessment Submission Failed', {
        error: errorMessage,
        userId: authState.user?.id,
        hasEncryptionKey: !!getEncryptionKey(),
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }, 'error');

      console.error('Failed to submit assessment:', error);
      setSubmissionError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    logToConsole('Retry Assessment Submission', {
      hasData: Object.keys(assessmentData).length > 0,
      isComplete: isAssessmentComplete()
    }, 'info');
    
    setSubmissionError('');
    if (isAssessmentComplete()) {
      submitEncryptedAssessment();
    }
  };

  if (isSubmitting) {
    return (
      <div className="h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground variant="assessment" intensity="subtle" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Encrypting and processing your information
            </h2>
            <p className="text-dark-400">Setting up your personalized healthcare experience...</p>
            <div className="text-xs text-primary-400 mt-4">
              🔒 Your data is being encrypted with AES-256-GCM before transmission
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submissionError) {
    return (
      <div className="h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <AnimatedBackground variant="assessment" intensity="subtle" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md relative z-10"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">❌</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Submission Failed</h2>
            <p className="text-red-400 text-sm">{submissionError}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => {
                setSubmissionError('');
                setAssessmentData({});
                setCurrentQuestionIndex(0);
              }}
              className="w-full px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-medium transition-colors"
            >
              Start Over
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Define question components array
  const questionComponents = [
    <NameQuestion 
      key="name"
      onValueChange={(value) => handleValueChange('name', value)}
      value={assessmentData.name}
    />,
    <AgeQuestion 
      key="age"
      onValueChange={(value) => handleValueChange('age', value)}
      value={assessmentData.age}
    />,
    <PhoneQuestion 
      key="phone"
      onValueChange={(value) => handleValueChange('phone', value)}
      onAdvance={handleNextQuestion}
      value={assessmentData.phone}
    />,
    <DiabetesQuestion 
      key="diabetes"
      onValueChange={(value) => handleValueChange('hasDiabetes', value)}
      onAdvance={handleNextQuestion}
      value={assessmentData.hasDiabetes}
    />,
    <BloodPressureQuestion 
      key="bloodpressure"
      onValueChange={(value) => handleValueChange('hasBloodPressure', value)}
      onAdvance={handleNextQuestion}
      value={assessmentData.hasBloodPressure}
    />,
    // Final submission step
    <motion.div
      key="submission"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="h-screen flex items-center justify-center py-24 px-4 relative overflow-hidden"
    >
      <AnimatedBackground variant="assessment" intensity="subtle" />
      
      <div className="w-full max-w-2xl text-center space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-success-500 to-primary-500 rounded-3xl mx-auto shadow-glow"
        >
          <span className="text-3xl">✨</span>
        </motion.div>

        <div className="space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-dark-300 text-lg"
          >
            Your personalized healthcare assistant is ready to help
          </motion.p>
        </div>

        {securityAlert && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Alert
              variant="error"
              description={securityAlert}
              dismissible
              onDismiss={() => setSecurityAlert('')}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Button
            onClick={submitEncryptedAssessment}
            variant="primary"
            size="xl"
            className="w-full"
            disabled={!isAssessmentComplete() || !authState.user}
          >
            Complete Assessment
          </Button>
          
          {!isAssessmentComplete() && (
            <p className="text-dark-400 text-sm mt-3">
              Please complete all questions above to continue
            </p>
          )}
          
          {!authState.user && (
            <div className="mt-4">
              <Alert
                variant="warning"
                description="You must be signed in with encryption enabled to submit your assessment securely."
              />
              <Button
                onClick={handleBackToLogin}
                variant="outline"
                size="lg"
                className="w-full mt-4"
              >
                Sign In
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  ];

  return (
    <>
      <Helmet>
        <title>Health Assessment | Clynic AI</title>
        <meta name="description" content="Complete your health assessment to get personalized healthcare recommendations from Clynic AI." />
      </Helmet>
      
      <div className="h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex overflow-hidden">
        {/* Vertical Progress Bar - Left Side */}
        <div className="flex-shrink-0 w-16 md:w-20 lg:w-24 relative z-10">
          <VerticalProgressBar current={currentQuestionIndex + 1} total={totalSteps} />
        </div>

        {/* Main Content - Question Display */}
        <div className="flex-1 relative z-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smooth parallax feel
              }}
              className="w-full h-full"
            >
              {questionComponents[currentQuestionIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}