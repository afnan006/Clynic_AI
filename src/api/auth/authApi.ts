import { axiosClient } from '../axiosInstance';
import { SignInResponse, OTPResponse } from './types';
import { USE_MOCK_API, API_ENDPOINTS } from '../config';
import { mockAuthApi } from '../mock/mockAuthApi';

class AuthApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('AUTH_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<SignInResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAuthApi.signInWithEmail(email, password);
    }

    this.logToConsole('signInWithEmail Started', { email, passwordLength: password.length }, 'info', `Starting email sign-in for ${email}`);
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.SIGN_IN_EMAIL, { email, password });
      
      this.logToConsole('signInWithEmail Success', { 
        userId: response.data.user.id,
        isExistingUser: !!response.data.user.salt,
        hasSalt: !!response.data.user.salt,
        agreedToTerms: response.data.user.agreedToTerms
      }, 'success', `Successfully signed in ${email}`);

      return response.data;
    } catch (error) {
      this.logToConsole('signInWithEmail Failed', {
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Sign-in failed for ${email}`);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<SignInResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAuthApi.signInWithGoogle();
    }

    this.logToConsole('signInWithGoogle Started', {}, 'info', 'Starting Google sign-in process');
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.SIGN_IN_GOOGLE);
      
      this.logToConsole('signInWithGoogle Success', { 
        userId: response.data.user.id,
        agreedToTerms: response.data.user.agreedToTerms
      }, 'success', 'Successfully signed in with Google account');
      
      return response.data;
    } catch (error) {
      this.logToConsole('signInWithGoogle Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Google sign-in failed');
      throw error;
    }
  }

  async signInWithPhone(phone: string, otp: string): Promise<SignInResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAuthApi.signInWithPhone(phone, otp);
    }

    this.logToConsole('signInWithPhone Started', { phone, otpLength: otp.length }, 'info', `Verifying phone number ${phone} with OTP`);
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.SIGN_IN_PHONE, { phone, otp });
      
      this.logToConsole('signInWithPhone Success', { 
        userId: response.data.user.id,
        agreedToTerms: response.data.user.agreedToTerms
      }, 'success', `Successfully verified phone number ${phone} and signed in`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('signInWithPhone Failed', {
        phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Phone verification failed for ${phone}`);
      throw error;
    }
  }

  async sendOTP(phone: string): Promise<OTPResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAuthApi.sendOTP(phone);
    }

    this.logToConsole('sendOTP Started', { phone }, 'info', `Sending verification code to ${phone}`);
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { phone });
      
      this.logToConsole('sendOTP Success', { phone }, 'success', `Verification code sent to ${phone}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('sendOTP Failed', {
        phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to send OTP to ${phone}`);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<SignInResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAuthApi.refreshToken(token);
    }

    this.logToConsole('refreshToken Started', { tokenLength: token.length }, 'info', 'Refreshing authentication token');
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { token });
      
      this.logToConsole('refreshToken Success', { 
        userId: response.data.user.id 
      }, 'success', 'Token refreshed successfully');
      
      return response.data;
    } catch (error) {
      this.logToConsole('refreshToken Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Token refresh failed');
      throw error;
    }
  }

  async signOut(): Promise<void> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAuthApi.signOut();
    }

    this.logToConsole('signOut Started', {}, 'info', 'Signing out user');
    
    try {
      await axiosClient.post(API_ENDPOINTS.AUTH.SIGN_OUT);
      
      this.logToConsole('signOut Success', {}, 'success', 'User signed out successfully');
    } catch (error) {
      this.logToConsole('signOut Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Sign out failed');
      throw error;
    }
  }
}

export const authApi = new AuthApi();