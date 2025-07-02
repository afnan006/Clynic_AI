import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, AuthState } from '../api/auth/types';
import { authApi } from '../api/auth/authApi';
import { generateSalt, deriveKey, base64ToArrayBuffer, arrayBufferToBase64 } from '../utils/encryption';

const AuthContext = createContext<{
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string, otp: string) => Promise<void>;
  signOut: () => void;
  updateUser: (user: User) => void;
  updateAgreedToTerms: () => void;
  getEncryptionKey: () => CryptoKey | null;
  reinitializeEncryption: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    encryptionKey: null,
    isKeyDerived: false,
  });

  // Use ref to store encryption key in volatile memory
  const encryptionKeyRef = useRef<CryptoKey | null>(null);
  const keyDerivationInProgress = useRef<boolean>(false);

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('AUTH', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  };

  /**
   * Sends encryption audit log to server
   */
  const sendEncryptionAuditLog = async (logData: {
    operation: string;
    dataType: string;
    success: boolean;
    errorMessage?: string;
    processingTimeMs: number;
    dataSize?: number;
    algorithm?: string;
    keyDerivationTime?: number;
  }) => {
    try {
      // Get user ID if available
      let userId = null;
      if (authState.user) {
        userId = authState.user.id;
      }

      // Prepare log data
      const auditLog = {
        ...logData,
        userId,
        ipAddress: 'client-side', // This will be replaced by the server
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      // In a real implementation, this would send the log to the server
      // For now, we'll just log it to the console
      if (typeof window !== 'undefined' && (window as any).devConsole) {
        (window as any).devConsole.log('ENCRYPTION_AUDIT', 'Auth Audit Log Created', auditLog, 'info', 
          `Created encryption audit log for ${logData.operation} operation (${logData.success ? 'success' : 'failed'})`);
      }

      // In a real implementation, you would send this to your server:
      // await fetch('/api/encryption-audit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(auditLog)
      // });
    } catch (error) {
      console.error('Failed to send encryption audit log', error);
    }
  };

  /**
   * Shows security alert to user
   */
  const showSecurityAlert = (title: string, message: string) => {
    // Dispatch a custom event that can be caught by the application
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('securityAlert', { 
        detail: { title, message, timestamp: new Date().toISOString() } 
      });
      window.dispatchEvent(event);
    }
  };

  /**
   * Handles user authentication and key derivation with bulletproof error handling
   */
  const handleUserAuthentication = async (user: User, passwordOrToken: string) => {
    if (keyDerivationInProgress.current) {
      logToConsole('Key Derivation Already In Progress', { userId: user.id }, 'warn', 'Encryption setup is already running for this user');
      return;
    }

    keyDerivationInProgress.current = true;
    const startTime = performance.now();

    logToConsole('🔐 BULLETPROOF ENCRYPTION SETUP STARTED', {
      userId: user.id,
      isNewUser: !user.salt,
      passwordLength: passwordOrToken.length,
      cryptoSupported: !!window.crypto?.subtle
    }, 'info', `Starting secure encryption setup for ${user.email || user.phone || 'user'} ${!user.salt ? '(new account)' : '(existing account)'}`);

    try {
      let salt: Uint8Array;
      let isNewUser = false;

      if (!user.salt) {
        // New user - generate salt
        logToConsole('🧂 Generating Salt for New User', { userId: user.id }, 'info', 'Creating a new cryptographic salt for this account');
        isNewUser = true;
        salt = await generateSalt();
        
        // Store salt with user (in real implementation, this would be stored on backend)
        user.salt = arrayBufferToBase64(salt.buffer);
        
        logToConsole('✅ Salt Generated Successfully', {
          userId: user.id,
          saltBase64: user.salt,
          saltLength: salt.length
        }, 'success', `Generated new salt for secure key derivation`);
      } else {
        // Existing user - retrieve salt
        logToConsole('🔍 Retrieving Existing Salt', { 
          userId: user.id,
          hasSalt: !!user.salt
        }, 'info', 'Loading existing cryptographic salt from user account');
        
        try {
          salt = new Uint8Array(base64ToArrayBuffer(user.salt));
          logToConsole('✅ Salt Retrieved Successfully', {
            userId: user.id,
            saltLength: salt.length
          }, 'success', 'Successfully loaded existing salt for key derivation');
        } catch (error) {
          logToConsole('❌ Salt Decode Failed - Regenerating', {
            userId: user.id,
            saltBase64: user.salt,
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 'error', 'Failed to decode existing salt - creating a new one for security');
          
          // Regenerate salt if decode fails
          salt = await generateSalt();
          user.salt = arrayBufferToBase64(salt.buffer);
          
          logToConsole('🔄 Salt Regenerated Successfully', {
            userId: user.id,
            newSaltBase64: user.salt
          }, 'success', 'Generated new salt to replace corrupted one');
        }
      }

      // Derive encryption key with maximum security
      logToConsole('🔑 Starting Military-Grade Key Derivation', {
        userId: user.id,
        iterations: 310000,
        algorithm: 'PBKDF2-SHA256',
        keyLength: 256,
        securityLevel: 'AES-256-GCM'
      }, 'info', 'Deriving encryption key using 310,000 PBKDF2 iterations for maximum security');

      const keyDerivationStart = performance.now();
      const encryptionKey = await deriveKey(passwordOrToken, salt, 310000, 256);
      const keyDerivationTime = performance.now() - keyDerivationStart;
      
      // Store key in volatile memory (ref)
      encryptionKeyRef.current = encryptionKey;

      // Log the key identifier for debugging
      const keyId = (encryptionKey as any).keyId || 'unknown_key';

      logToConsole('🎯 KEY DERIVATION COMPLETE - ENCRYPTION READY', {
        userId: user.id,
        keyDerivationTimeMs: keyDerivationTime.toFixed(2),
        keyDerivationTimeSeconds: (keyDerivationTime / 1000).toFixed(3),
        keyStored: !!encryptionKeyRef.current,
        isNewUser,
        securityStatus: 'MAXIMUM',
        encryptionReady: true,
        keyId: keyId // Include key identifier
      }, 'success', `Encryption is now ready! Key derived in ${(keyDerivationTime / 1000).toFixed(1)} seconds - all messages will be encrypted with military-grade security (Key ID: ${keyId})`);

      // Update auth state
      setAuthState({
        user,
        isLoading: false,
        error: null,
        encryptionKey,
        isKeyDerived: true,
      });

      // Store user data (including salt for existing users)
      localStorage.setItem('user_data', JSON.stringify(user));

      // Send audit log
      await sendEncryptionAuditLog({
        operation: 'key_derivation',
        dataType: 'user_authentication',
        success: true,
        processingTimeMs: keyDerivationTime,
        algorithm: 'PBKDF2-SHA256',
        keyDerivationTime: keyDerivationTime
      });

      logToConsole('🚀 AUTHENTICATION COMPLETE - SYSTEM READY', {
        userId: user.id,
        isOnboarded: user.isOnboarded,
        agreedToTerms: user.agreedToTerms,
        encryptionKeyAvailable: !!encryptionKey,
        isKeyDerived: true,
        systemStatus: 'FULLY_OPERATIONAL',
        totalTimeMs: (performance.now() - startTime).toFixed(2),
        keyId: keyId // Include key identifier
      }, 'success', `${user.email || user.phone || 'User'} is now signed in with full encryption protection (Key ID: ${keyId})`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logToConsole('💥 CRITICAL ENCRYPTION SETUP FAILURE', {
        userId: user.id,
        error: errorMessage,
        fallbackAction: 'User will be signed out for security'
      }, 'error', `Encryption setup failed for security reasons - user will need to sign in again`);

      // Send audit log
      await sendEncryptionAuditLog({
        operation: 'key_derivation',
        dataType: 'user_authentication',
        success: false,
        errorMessage: errorMessage,
        processingTimeMs: performance.now() - startTime
      });

      // Show security alert
      showSecurityAlert(
        'Encryption Setup Failed',
        'Your secure encryption could not be set up. For your security, you will need to sign in again.'
      );

      // For security, sign out user if encryption setup fails
      setAuthState({
        user: null,
        isLoading: false,
        error: 'Encryption setup failed. Please sign in again for security.',
        encryptionKey: null,
        isKeyDerived: false,
      });
      
      // Clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      throw error;
    } finally {
      keyDerivationInProgress.current = false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      logToConsole('AuthProvider Initialized', { 
        cryptoSupported: !!window.crypto?.subtle,
        storageAvailable: !!localStorage
      }, 'info', 'Authentication system is starting up');

      // Check for existing auth token
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          logToConsole('Existing Session Found', { 
            userId: user.id,
            hasEmail: !!user.email,
            hasPhone: !!user.phone,
            isOnboarded: user.isOnboarded,
            agreedToTerms: user.agreedToTerms,
            hasSalt: !!user.salt
          }, 'info', `Found existing session for ${user.email || user.phone || 'user'} - setting up encryption`);

          // Set initial state with user but no encryption key yet
          setAuthState({ 
            user, 
            isLoading: true, // Keep loading true while setting up encryption
            error: null, 
            encryptionKey: null, 
            isKeyDerived: false 
          });

          // Initialize encryption for existing session
          logToConsole('🔄 Initializing Encryption for Existing Session', {
            userId: user.id,
            hasToken: !!token,
            tokenLength: token.length
          }, 'info', 'Setting up encryption for existing user session');

          await handleUserAuthentication(user, token);
          
        } catch (error) {
          logToConsole('Session Restore Failed', { 
            error: error instanceof Error ? error.message : 'Unknown error'
          }, 'error', 'Failed to restore previous session - user will need to sign in again');
          
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setAuthState({ 
            user: null, 
            isLoading: false, 
            error: null, 
            encryptionKey: null, 
            isKeyDerived: false 
          });
        }
      } else {
        logToConsole('No Existing Session', {}, 'info', 'No previous session found - user needs to sign in');
        setAuthState({ 
          user: null, 
          isLoading: false, 
          error: null, 
          encryptionKey: null, 
          isKeyDerived: false 
        });
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    logToConsole('Email Sign In Started', { 
      email,
      passwordLength: password.length
    }, 'info', `Starting sign-in process for ${email}`);

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, token } = await authApi.signInWithEmail(email, password);
      
      // Set agreedToTerms to false for new users
      user.agreedToTerms = user.agreedToTerms ?? false;
      
      logToConsole('API Sign In Success', {
        userId: user.id,
        tokenReceived: !!token,
        agreedToTerms: user.agreedToTerms
      }, 'success', `Successfully authenticated ${email} with server`);

      localStorage.setItem('auth_token', token);
      await handleUserAuthentication(user, password);
      
    } catch (error) {
      const errorMessage = 'Failed to sign in. Please try again.';
      logToConsole('Email Sign In Failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Sign-in failed for ${email} - please check credentials and try again`);

      // Send audit log
      await sendEncryptionAuditLog({
        operation: 'authentication',
        dataType: 'user_login',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: 0
      });

      setAuthState({ 
        user: null, 
        isLoading: false, 
        error: errorMessage,
        encryptionKey: null,
        isKeyDerived: false,
      });
    }
  };

  const signInWithGoogle = async () => {
    logToConsole('Google Sign In Started', {}, 'info', 'Starting Google sign-in process');
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, token } = await authApi.signInWithGoogle();
      
      // Set agreedToTerms to false for new users
      user.agreedToTerms = user.agreedToTerms ?? false;
      
      logToConsole('Google API Success', {
        userId: user.id,
        tokenReceived: !!token,
        agreedToTerms: user.agreedToTerms
      }, 'success', 'Successfully authenticated with Google account');

      localStorage.setItem('auth_token', token);
      
      // For Google sign-in, use the token as the password for key derivation
      await handleUserAuthentication(user, token);
      
    } catch (error) {
      const errorMessage = 'Failed to sign in with Google. Please try again.';
      logToConsole('Google Sign In Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Google sign-in failed - please try again');

      // Send audit log
      await sendEncryptionAuditLog({
        operation: 'authentication',
        dataType: 'google_login',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: 0
      });

      setAuthState({ 
        user: null, 
        isLoading: false, 
        error: errorMessage,
        encryptionKey: null,
        isKeyDerived: false,
      });
    }
  };

  const signInWithPhone = async (phone: string, otp: string) => {
    logToConsole('Phone Sign In Started', { 
      phone,
      otpLength: otp.length
    }, 'info', `Verifying phone number ${phone} with OTP code`);

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { user, token } = await authApi.signInWithPhone(phone, otp);
      
      // Set agreedToTerms to false for new users
      user.agreedToTerms = user.agreedToTerms ?? false;
      
      logToConsole('Phone API Success', {
        userId: user.id,
        tokenReceived: !!token,
        agreedToTerms: user.agreedToTerms
      }, 'success', `Successfully verified ${phone} and authenticated user`);

      localStorage.setItem('auth_token', token);
      
      // For phone sign-in, use phone + otp as the password for key derivation
      await handleUserAuthentication(user, phone + otp);
      
    } catch (error) {
      const errorMessage = 'Failed to verify OTP. Please try again.';
      logToConsole('Phone Sign In Failed', {
        phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Phone verification failed for ${phone} - please check OTP and try again`);

      // Send audit log
      await sendEncryptionAuditLog({
        operation: 'authentication',
        dataType: 'phone_login',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTimeMs: 0
      });

      setAuthState({ 
        user: null, 
        isLoading: false, 
        error: errorMessage,
        encryptionKey: null,
        isKeyDerived: false,
      });
    }
  };

  const signOut = () => {
    // Get key identifier if available
    const keyId = encryptionKeyRef.current ? (encryptionKeyRef.current as any).keyId || 'unknown_key' : 'no_key';
    
    logToConsole('🔒 SECURE SIGN OUT INITIATED', {
      userId: authState.user?.id,
      hadEncryptionKey: !!encryptionKeyRef.current,
      keyId: keyId
    }, 'info', `${authState.user?.email || authState.user?.phone || 'User'} is signing out - clearing all encryption keys (Key ID: ${keyId})`);

    // Clear encryption key from memory
    encryptionKeyRef.current = null;
    
    // Clear storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    setAuthState({ 
      user: null, 
      isLoading: false, 
      error: null,
      encryptionKey: null,
      isKeyDerived: false,
    });

    // Send audit log
    sendEncryptionAuditLog({
      operation: 'sign_out',
      dataType: 'user_session',
      success: true,
      processingTimeMs: 0
    });

    logToConsole('✅ SECURE SIGN OUT COMPLETE', {
      keyCleared: !encryptionKeyRef.current,
      storageCleared: !localStorage.getItem('auth_token'),
      securityStatus: 'CLEAN'
    }, 'success', 'Sign-out complete - all encryption keys and session data have been securely cleared');
  };

  const updateUser = (user: User) => {
    logToConsole('User Update Started', {
      userId: user.id,
      changes: {
        isOnboarded: user.isOnboarded,
        agreedToTerms: user.agreedToTerms,
        hasName: !!user.name,
        hasPhone: !!user.phone
      }
    }, 'info', `Updating user profile for ${user.email || user.phone || 'user'}`);

    localStorage.setItem('user_data', JSON.stringify(user));
    setAuthState(prev => ({ ...prev, user }));

    logToConsole('User Update Complete', {
      userId: user.id
    }, 'success', 'User profile updated successfully');
  };

  const updateAgreedToTerms = () => {
    if (!authState.user) return;

    logToConsole('Terms Agreement Updated', {
      userId: authState.user.id,
      agreedToTerms: true
    }, 'success', `User ${authState.user.email || authState.user.phone || 'user'} agreed to terms and conditions`);

    const updatedUser = { ...authState.user, agreedToTerms: true };
    updateUser(updatedUser);
  };

  const getEncryptionKey = (): CryptoKey | null => {
    const key = encryptionKeyRef.current;
    
    // Get key identifier if available
    const keyId = key ? (key as any).keyId || 'unknown_key' : 'no_key';
    
    // Log key retrieval for debugging
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('AUTH', 'getEncryptionKey', {
        hasKey: !!key,
        keyId: keyId,
        keyType: key ? key.type : 'none',
        keyAlgorithm: key ? key.algorithm : 'none',
        keyUsages: key ? key.usages : 'none',
        timestamp: new Date().toISOString()
      }, key ? 'info' : 'warn', key 
        ? `Retrieved encryption key ${keyId} for use` 
        : 'No encryption key available - this may cause security issues');
    }
    
    // Only log if key is not available and user expects it
    if (!key && authState.user && authState.isKeyDerived) {
      logToConsole('⚠️ Encryption Key Missing', {
        hasUser: !!authState.user,
        isKeyDerived: authState.isKeyDerived,
        keyInMemory: !!key,
        securityAlert: true
      }, 'warn', 'Encryption key is missing - user may need to sign in again');
      
      // Show security alert
      showSecurityAlert(
        'Encryption Key Missing',
        'Your encryption key is no longer available. For security reasons, please sign in again.'
      );
    }
    
    return key;
  };

  const reinitializeEncryption = async (): Promise<void> => {
    if (!authState.user) {
      logToConsole('🚫 Cannot Reinitialize - No User', {}, 'warn', 'Cannot retry encryption setup - no user is signed in');
      return;
    }

    if (keyDerivationInProgress.current) {
      logToConsole('🔄 Encryption Reinitialization Already In Progress', {
        userId: authState.user.id
      }, 'warn', 'Encryption setup is already running - please wait');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      logToConsole('🚫 Cannot Reinitialize - No Token', {
        userId: authState.user.id
      }, 'error', 'Cannot retry encryption setup - authentication token is missing');
      
      // Show security alert
      showSecurityAlert(
        'Authentication Required',
        'Your authentication token is missing. Please sign in again to re-establish secure encryption.'
      );
      
      return;
    }

    logToConsole('🔄 MANUAL ENCRYPTION REINITIALIZATION STARTED', {
      userId: authState.user.id,
      currentKeyDerived: authState.isKeyDerived,
      hasToken: !!token
    }, 'info', `Retrying encryption setup for ${authState.user.email || authState.user.phone || 'user'}`);

    // Set loading state
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await handleUserAuthentication(authState.user, token);
      
      // Get key identifier if available
      const keyId = encryptionKeyRef.current ? (encryptionKeyRef.current as any).keyId || 'unknown_key' : 'no_key';
      
      logToConsole('✅ Manual Encryption Reinitialization Complete', {
        userId: authState.user.id,
        success: true,
        keyId: keyId
      }, 'success', `Encryption setup completed successfully - messages are now secure (Key ID: ${keyId})`);
    } catch (error) {
      logToConsole('❌ Manual Encryption Reinitialization Failed', {
        userId: authState.user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Failed to set up encryption - please try signing in again');
      
      // Show security alert
      showSecurityAlert(
        'Encryption Setup Failed',
        'We could not re-establish your encryption key. Please sign in again for your security.'
      );
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to initialize encryption. Please try signing in again.' 
      }));
    }
  };

  return (
    <AuthContext.Provider value={{
      authState,
      signIn,
      signInWithGoogle,
      signInWithPhone,
      signOut,
      updateUser,
      updateAgreedToTerms,
      getEncryptionKey,
      reinitializeEncryption,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}