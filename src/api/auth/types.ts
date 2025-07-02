export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  isOnboarded: boolean;
  agreedToTerms: boolean;
  createdAt: Date;
  salt?: string; // Base64 encoded salt for key derivation
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  encryptionKey: CryptoKey | null; // Derived encryption key stored in memory
  isKeyDerived: boolean; // Flag to track if key derivation is complete
}

export interface SignInResponse {
  user: User;
  token: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}