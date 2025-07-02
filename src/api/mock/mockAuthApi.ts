import { SignInResponse, OTPResponse } from '../auth/types';

class MockAuthApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('AUTH_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<SignInResponse> {
    this.logToConsole('signInWithEmail Started', { email, passwordLength: password.length }, 'info', `Starting email sign-in for ${email}`);
    
    try {
      // Mock implementation with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate existing user with salt (for demo)
      const isExistingUser = email.includes('existing');
      const user = { 
        id: '1', 
        email, 
        isOnboarded: false,
        agreedToTerms: false,
        createdAt: new Date(),
        salt: isExistingUser ? 'dGVzdC1zYWx0LWZvci1leGlzdGluZy11c2Vy' : undefined
      };
      
      const result = {
        user,
        token: 'mock_token_123'
      };

      this.logToConsole('signInWithEmail Success', { 
        userId: user.id,
        isExistingUser,
        hasSalt: !!user.salt,
        agreedToTerms: user.agreedToTerms
      }, 'success', `Successfully signed in ${email} ${isExistingUser ? 'with existing account' : 'as new user'}`);

      return result;
    } catch (error) {
      this.logToConsole('signInWithEmail Failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Sign-in failed for ${email}`);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<SignInResponse> {
    this.logToConsole('signInWithGoogle Started', {}, 'info', 'Starting Google sign-in process');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = { 
        id: '2', 
        email: 'user@gmail.com', 
        isOnboarded: false,
        agreedToTerms: false,
        createdAt: new Date()
      };
      
      const result = {
        user,
        token: 'mock_google_token_456'
      };

      this.logToConsole('signInWithGoogle Success', { 
        userId: user.id,
        agreedToTerms: user.agreedToTerms
      }, 'success', 'Successfully signed in with Google account');
      
      return result;
    } catch (error) {
      this.logToConsole('signInWithGoogle Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Google sign-in failed');
      throw error;
    }
  }

  async signInWithPhone(phone: string, otp: string): Promise<SignInResponse> {
    this.logToConsole('signInWithPhone Started', { phone, otpLength: otp.length }, 'info', `Verifying phone number ${phone} with OTP`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = { 
        id: '3', 
        phone, 
        isOnboarded: false,
        agreedToTerms: false,
        createdAt: new Date()
      };
      
      const result = {
        user,
        token: 'mock_phone_token_789'
      };

      this.logToConsole('signInWithPhone Success', { 
        userId: user.id,
        agreedToTerms: user.agreedToTerms
      }, 'success', `Successfully verified phone number ${phone} and signed in`);
      
      return result;
    } catch (error) {
      this.logToConsole('signInWithPhone Failed', {
        phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Phone verification failed for ${phone}`);
      throw error;
    }
  }

  async sendOTP(phone: string): Promise<OTPResponse> {
    this.logToConsole('sendOTP Started', { phone }, 'info', `Sending verification code to ${phone}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = { success: true, message: 'OTP sent successfully' };
      
      this.logToConsole('sendOTP Success', { phone }, 'success', `Verification code sent to ${phone}`);
      
      return result;
    } catch (error) {
      this.logToConsole('sendOTP Failed', {
        phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to send OTP to ${phone}`);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<SignInResponse> {
    this.logToConsole('refreshToken Started', { tokenLength: token.length }, 'info', 'Refreshing authentication token');
    
    try {
      // In real implementation: POST /auth/refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock refresh response
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      const result = {
        user,
        token: `refreshed_${Date.now()}`
      };

      this.logToConsole('refreshToken Success', { 
        userId: user.id 
      }, 'success', 'Token refreshed successfully');
      
      return result;
    } catch (error) {
      this.logToConsole('refreshToken Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Token refresh failed');
      throw error;
    }
  }

  async signOut(): Promise<void> {
    this.logToConsole('signOut Started', {}, 'info', 'Signing out user');
    
    try {
      // In real implementation: POST /auth/signout
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.logToConsole('signOut Success', {}, 'success', 'User signed out successfully');
    } catch (error) {
      this.logToConsole('signOut Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Sign out failed');
      throw error;
    }
  }
}

export const mockAuthApi = new MockAuthApi();