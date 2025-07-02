import axios, { AxiosInstance } from 'axios';
import { generateIv, encrypt, decrypt, arrayBufferToBase64, base64ToArrayBuffer, deriveKey, generateSalt } from './encryption';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Symptom checker conversation state
interface ConversationState {
  step: number;
  symptoms: string[];
  duration?: string;
  type?: string;
  location?: string;
  temperature?: number;
  medicinesTaken?: string[];
}

class ApiClient {
  private client: AxiosInstance;
  private mockEncryptionKey: CryptoKey | null = null;
  private conversationStates: Map<string, ConversationState> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Initialize mock encryption key for server simulation
    this.initializeMockEncryptionKey();
  }

  private async initializeMockEncryptionKey() {
    try {
      // Create a mock server-side encryption key for demonstration
      const mockPassword = 'server-side-encryption-key-2024';
      const mockSalt = await generateSalt();
      this.mockEncryptionKey = await deriveKey(mockPassword, mockSalt);
      
      this.logToConsole('Mock Server Encryption Key Initialized', {
        keyAvailable: !!this.mockEncryptionKey,
        purpose: 'Server-side encryption simulation'
      }, 'success', 'Server-side encryption key is ready for demo purposes');
    } catch (error) {
      this.logToConsole('Failed to Initialize Mock Server Key', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Failed to set up server-side encryption key for demo');
    }
  }

  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  private getUserId(): string {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return 'demo';
  }

  private getConversationState(userId: string): ConversationState {
    if (!this.conversationStates.has(userId)) {
      this.conversationStates.set(userId, {
        step: 0,
        symptoms: []
      });
    }
    return this.conversationStates.get(userId)!;
  }

  private updateConversationState(userId: string, updates: Partial<ConversationState>) {
    const current = this.getConversationState(userId);
    this.conversationStates.set(userId, { ...current, ...updates });
  }

  private resetConversationState(userId: string) {
    this.conversationStates.delete(userId);
  }

  private async getLocationWeather(): Promise<{ location: string; temperature: number }> {
    // Mock weather data - in real implementation, you'd use geolocation + weather API
    const mockLocations = [
      { location: 'Mumbai, India', temperature: 28 },
      { location: 'Delhi, India', temperature: 23 },
      { location: 'Bangalore, India', temperature: 25 },
      { location: 'Chennai, India', temperature: 31 },
      { location: 'Kolkata, India', temperature: 27 }
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  }

  private generateSymptomCheckerResponse(userMessage: string, userId: string) {
    const lowerMessage = userMessage.toLowerCase();
    const state = this.getConversationState(userId);

    // Initial symptom detection
    if (lowerMessage.includes('cold') || lowerMessage.includes('fever') || lowerMessage.includes('cough') || lowerMessage.includes('headache')) {
      const symptom = lowerMessage.includes('cold') ? 'cold' : 
                     lowerMessage.includes('fever') ? 'fever' :
                     lowerMessage.includes('cough') ? 'cough' : 'headache';
      
      this.updateConversationState(userId, { 
        step: 1, 
        symptoms: [symptom] 
      });

      return {
        id: Date.now().toString(),
        message: `I understand you're experiencing ${symptom}. Let me ask you a few questions to better understand your condition.`,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date(),
        followUpQuestion: {
          text: 'How long have you been experiencing this?',
          options: [
            { label: '< 1 hour', value: 'less_than_1hr', icon: '⏰' },
            { label: '1-5 hours', value: '1_5_hrs', icon: '🕐' },
            { label: '6-18 hours', value: '6_18_hrs', icon: '🕕' },
            { label: '> 1 day', value: 'more_than_1day', icon: '📅' }
          ],
          questionType: 'single_choice'
        }
      };
    }

    // Handle duration response
    if (state.step === 1 && ['less_than_1hr', '1_5_hrs', '6_18_hrs', 'more_than_1day'].includes(userMessage)) {
      this.updateConversationState(userId, { 
        step: 2, 
        duration: userMessage 
      });

      const symptom = state.symptoms[0];
      if (symptom === 'cold') {
        return {
          id: Date.now().toString(),
          message: 'Thank you. Now I need to understand the type of cold you\'re experiencing.',
          messageType: 'text',
          sender: 'ai',
          timestamp: new Date(),
          followUpQuestion: {
            text: 'Is it a dry cold or wet cold?',
            options: [
              { label: 'Dry Cold', value: 'dry_cold', icon: '🌵', color: 'orange' },
              { label: 'Wet Cold', value: 'wet_cold', icon: '💧', color: 'blue' }
            ],
            questionType: 'single_choice'
          }
        };
      }
    }

    // Handle cold type response and get weather
    if (state.step === 2 && ['dry_cold', 'wet_cold'].includes(userMessage)) {
      this.updateConversationState(userId, { 
        step: 3, 
        type: userMessage 
      });

      return this.getLocationWeather().then(({ location, temperature }) => {
        this.updateConversationState(userId, { location, temperature });
        
        return {
          id: Date.now().toString(),
          message: `I see you have a ${userMessage.replace('_', ' ')}. Let me check the weather in your area.`,
          messageType: 'text',
          sender: 'ai',
          timestamp: new Date(),
          followUpQuestion: {
            text: 'Did you take any medicine or should I suggest one?',
            options: [
              { label: 'Already Taken', value: 'taken', icon: '💊', color: 'green' },
              { label: 'Suggest Medicine', value: 'suggest', icon: '🔍', color: 'blue' }
            ],
            questionType: 'single_choice',
            context: {
              location,
              temperature
            }
          }
        };
      });
    }

    // Handle medicine response
    if (state.step === 3 && ['taken', 'suggest'].includes(userMessage)) {
      if (userMessage === 'taken') {
        this.updateConversationState(userId, { step: 4 });
        
        return {
          id: Date.now().toString(),
          message: 'Which medicine did you take and when?',
          messageType: 'text',
          sender: 'ai',
          timestamp: new Date(),
          followUpQuestion: {
            text: 'Please tell me the medicine name and when you took it:',
            questionType: 'text_input',
            placeholder: 'e.g., Paracetamol 2 hours ago',
            required: true
          }
        };
      } else {
        this.resetConversationState(userId);
        
        return {
          id: Date.now().toString(),
          message: `Based on your ${state.type?.replace('_', ' ')} and the current temperature of ${state.temperature}°C in ${state.location}, I recommend the following medicines. Please consult with a healthcare provider before taking any medication.`,
          messageType: 'text',
          sender: 'ai',
          timestamp: new Date(),
          showMedicines: true
        };
      }
    }

    // Handle medicine details response
    if (state.step === 4) {
      this.resetConversationState(userId);
      
      return {
        id: Date.now().toString(),
        message: `Thank you for the information. Based on your symptoms and the medicine you've taken, here are some additional recommendations:\n\n1. Stay hydrated\n2. Get plenty of rest\n3. Monitor your symptoms\n4. If symptoms worsen or persist for more than 3 days, please consult a healthcare provider.\n\nFeel better soon!`,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date()
      };
    }

    // Default response for unrecognized input during conversation
    if (state.step > 0) {
      return {
        id: Date.now().toString(),
        message: 'I didn\'t understand that response. Could you please select one of the provided options or start over by describing your symptoms?',
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date()
      };
    }

    return null;
  }

  // Mock API methods - replace with real endpoints later
  async signInWithEmail(email: string, password: string) {
    this.logToConsole('signInWithEmail Started', { email, passwordLength: password.length }, 'info', `Starting email sign-in for ${email}`);
    
    // Mock implementation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate existing user with salt (for demo)
    const isExistingUser = email.includes('existing');
    const user = { 
      id: '1', 
      email, 
      isOnboarded: false,
      agreedToTerms: false, // New users haven't agreed to terms yet
      createdAt: new Date(),
      // Simulate existing user having a salt
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
  }

  async signInWithGoogle() {
    this.logToConsole('signInWithGoogle Started', {}, 'info', 'Starting Google sign-in process');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = { 
      id: '2', 
      email: 'user@gmail.com', 
      isOnboarded: false,
      agreedToTerms: false, // New users haven't agreed to terms yet
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
  }

  async signInWithPhone(phone: string, otp: string) {
    this.logToConsole('signInWithPhone Started', { phone, otpLength: otp.length }, 'info', `Verifying phone number ${phone} with OTP`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = { 
      id: '3', 
      phone, 
      isOnboarded: false,
      agreedToTerms: false, // New users haven't agreed to terms yet
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
  }

  async sendOTP(phone: string) {
    this.logToConsole('sendOTP Started', { phone }, 'info', `Sending verification code to ${phone}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = { success: true, message: 'OTP sent successfully' };
    
    this.logToConsole('sendOTP Success', { phone }, 'success', `Verification code sent to ${phone}`);
    return result;
  }

  async submitAssessment(payload: any) {
    this.logToConsole('submitAssessment Started', { 
      hasEncryptedData: !!payload.encryptedData,
      hasIv: !!payload.iv,
      userId: payload.userId,
      encrypted: payload.encrypted,
      payloadKeys: Object.keys(payload),
      timestamp: payload.timestamp
    }, 'info', `Submitting ${payload.encrypted ? 'encrypted' : 'plain text'} health assessment for user ${payload.userId}`);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate payload based on encryption status
      if (payload.encrypted) {
        if (!payload.encryptedData || !payload.iv) {
          throw new Error('Invalid encrypted payload: missing encryptedData or iv');
        }
        
        this.logToConsole('Processing Encrypted Assessment', {
          encryptedDataLength: payload.encryptedData.length,
          ivLength: payload.iv.length,
          userId: payload.userId,
          serverTimestamp: new Date().toISOString()
        }, 'info', `Processing encrypted assessment data (${payload.encryptedData.length} bytes) for user ${payload.userId}`);
      } else {
        this.logToConsole('Processing Unencrypted Assessment (Demo Mode)', {
          dataKeys: Object.keys(payload).filter(key => !['userId', 'timestamp', 'encrypted'].includes(key)),
          userId: payload.userId,
          demoMode: true
        }, 'warn', `Processing plain text assessment data for demo user ${payload.userId}`);
      }
      
      const result = { 
        success: true, 
        message: payload.encrypted ? 'Encrypted assessment submitted successfully' : 'Assessment submitted successfully (demo mode)',
        assessmentId: `assessment_${Date.now()}`,
        encryptionVerified: payload.encrypted,
        timestamp: new Date().toISOString()
      };
      
      this.logToConsole('submitAssessment Success', {
        assessmentId: result.assessmentId,
        encryptionVerified: result.encryptionVerified,
        userId: payload.userId,
        encrypted: payload.encrypted
      }, 'success', `Assessment successfully saved with ID ${result.assessmentId} ${payload.encrypted ? 'with full encryption' : 'in demo mode'}`);
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.logToConsole('submitAssessment Failed', {
        error: errorMessage,
        userId: payload.userId,
        encrypted: payload.encrypted,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }, 'error', `Failed to submit assessment for user ${payload.userId}: ${errorMessage}`);
      
      // Re-throw the error to be handled by the calling code
      throw new Error(`Assessment submission failed: ${errorMessage}`);
    }
  }

  async sendMessage(messageInput: string | { encryptedData: string; iv: string; originalMessage?: string }) {
    const startTime = performance.now();
    const userId = this.getUserId();
    
    // Determine if message is encrypted or plain text
    const isEncrypted = typeof messageInput !== 'string';
    
    if (isEncrypted) {
      const encryptedMessage = messageInput as { encryptedData: string; iv: string; originalMessage?: string };
      
      this.logToConsole('🌐 SERVER: Received Encrypted Message', {
        encryptedDataLength: encryptedMessage.encryptedData.length,
        ivLength: encryptedMessage.iv.length,
        hasOriginalForDemo: !!encryptedMessage.originalMessage,
        serverProcessingStart: new Date().toISOString()
      }, 'info', `Server received encrypted message that looks like "${encryptedMessage.encryptedData.substring(0, 20)}..." and will process it securely`);

      // Simulate server-side decryption (for demo purposes)
      let decryptedMessage = '';
      if (this.mockEncryptionKey && encryptedMessage.encryptedData && encryptedMessage.iv) {
        try {
          const serverDecryptionStart = performance.now();
          
          // Convert Base64 back to ArrayBuffer
          const encryptedDataBuffer = base64ToArrayBuffer(encryptedMessage.encryptedData);
          const ivBuffer = new Uint8Array(base64ToArrayBuffer(encryptedMessage.iv));
          
          // Note: In a real implementation, the server would use its own key derivation
          // For demo, we'll use the original message if available
          decryptedMessage = encryptedMessage.originalMessage || '[Server could not decrypt - different key]';
          
          const serverDecryptionTime = performance.now() - serverDecryptionStart;
          
          this.logToConsole('🔓 SERVER: Message Decryption Simulation', {
            encryptedLength: encryptedDataBuffer.byteLength,
            decryptedMessage: decryptedMessage.substring(0, 50) + '...',
            decryptedLength: decryptedMessage.length,
            serverDecryptionTimeMs: serverDecryptionTime.toFixed(2),
            note: 'Using original message for demo - real server would decrypt with its own key'
          }, 'success', `Server decrypted the message in ${serverDecryptionTime.toFixed(0)}ms and it says: "${decryptedMessage.substring(0, 30)}${decryptedMessage.length > 30 ? '...' : ''}"`);
          
        } catch (error) {
          this.logToConsole('❌ SERVER: Decryption Failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            fallbackUsed: true
          }, 'error', 'Server failed to decrypt the message - using fallback');
          
          decryptedMessage = encryptedMessage.originalMessage || 'Failed to decrypt message';
        }
      } else {
        decryptedMessage = encryptedMessage.originalMessage || 'Encryption key not available on server';
      }

      // Check for symptom checker flow
      const symptomResponse = this.generateSymptomCheckerResponse(decryptedMessage, userId);
      if (symptomResponse) {
        const response = await symptomResponse;
        
        // Handle follow-up questions
        if (response.followUpQuestion) {
          return this.createEncryptedQuestionResponse(response, response.followUpQuestion);
        }
        
        // Handle medicine suggestions
        if (response.showMedicines) {
          return this.createEncryptedResponseWithMedicines(response);
        }
        
        return this.createEncryptedResponse(response);
      }

      // Generate regular AI response
      const aiResponse = this.getMockResponse(decryptedMessage);
      return this.createEncryptedResponse({
        id: Date.now().toString(),
        message: aiResponse,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date()
      });
      
    } else {
      // Handle plain text message
      const plainMessage = messageInput as string;
      
      this.logToConsole('📝 SERVER: Received Plain Text Message', {
        messageLength: plainMessage.length,
        messagePreview: plainMessage.substring(0, 50) + (plainMessage.length > 50 ? '...' : ''),
        encrypted: false,
        demoMode: true
      }, 'warn', `Server received plain text message: "${plainMessage.substring(0, 30)}${plainMessage.length > 30 ? '...' : ''}" (demo mode)`);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const plainMessage = typeof messageInput === 'string' ? messageInput : messageInput.originalMessage || '';
    
    // Check for symptom checker flow
    const symptomResponse = this.generateSymptomCheckerResponse(plainMessage, userId);
    if (symptomResponse) {
      const response = await symptomResponse;
      
      // Handle follow-up questions
      if (response.followUpQuestion) {
        return {
          ...response,
          messageType: 'question',
          questionData: response.followUpQuestion,
          encrypted: false
        };
      }
      
      // Handle medicine suggestions
      if (response.showMedicines) {
        return {
          ...response,
          encrypted: false
        };
      }
      
      return {
        ...response,
        encrypted: false
      };
    }
    
    const aiResponse = this.getMockResponse(plainMessage);
    const totalTime = performance.now() - startTime;

    const result = {
      id: Date.now().toString(),
      message: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      messageType: 'text',
      encrypted: false
    };

    this.logToConsole('📤 SERVER: Plain Text Response', {
      responseId: result.id,
      responseLength: aiResponse.length,
      totalServerTimeMs: totalTime.toFixed(2),
      totalServerTimeSeconds: (totalTime / 1000).toFixed(3),
      encrypted: false
    }, 'success', `Server responded with plain text message: "${aiResponse.substring(0, 50)}${aiResponse.length > 50 ? '...' : ''}" in ${(totalTime / 1000).toFixed(1)} seconds`);
    
    return result;
  }

  private async createEncryptedQuestionResponse(response: any, questionData: any) {
    if (this.mockEncryptionKey) {
      try {
        const responseEncryptionStart = performance.now();
        
        // Generate new IV for response
        const responseIv = await generateIv();
        
        // Encrypt AI response
        const { encryptedData: encryptedResponse } = await encrypt(response.message, this.mockEncryptionKey, responseIv);
        
        // Convert to Base64 for transmission
        const encryptedResponseBase64 = arrayBufferToBase64(encryptedResponse);
        const responseIvBase64 = arrayBufferToBase64(responseIv.buffer);
        
        const responseEncryptionTime = performance.now() - responseEncryptionStart;
        
        this.logToConsole('🔐 SERVER: Question Response Encrypted', {
          originalResponseLength: response.message.length,
          encryptedResponseLength: encryptedResponse.byteLength,
          hasQuestionData: !!questionData,
          responseEncryptionTimeMs: responseEncryptionTime.toFixed(2)
        }, 'success', `Server encrypted question response with follow-up question`);

        return {
          id: response.id,
          message: response.message,
          encryptedData: encryptedResponseBase64,
          iv: responseIvBase64,
          sender: 'ai',
          timestamp: response.timestamp,
          messageType: 'question',
          questionData: questionData,
          encrypted: true
        };
        
      } catch (error) {
        this.logToConsole('❌ SERVER: Question Response Encryption Failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'error', 'Failed to encrypt question response');
      }
    }

    // Fallback to plain text
    return {
      ...response,
      messageType: 'question',
      questionData: questionData,
      encrypted: false
    };
  }

  private async createEncryptedResponseWithMedicines(response: any) {
    if (this.mockEncryptionKey) {
      try {
        const responseIv = await generateIv();
        const { encryptedData: encryptedResponse } = await encrypt(response.message, this.mockEncryptionKey, responseIv);
        const encryptedResponseBase64 = arrayBufferToBase64(encryptedResponse);
        const responseIvBase64 = arrayBufferToBase64(responseIv.buffer);

        return {
          id: response.id,
          message: response.message,
          encryptedData: encryptedResponseBase64,
          iv: responseIvBase64,
          sender: 'ai',
          timestamp: response.timestamp,
          messageType: 'text',
          showMedicines: true,
          encrypted: true
        };
      } catch (error) {
        this.logToConsole('❌ SERVER: Medicine Response Encryption Failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'error', 'Failed to encrypt medicine response');
      }
    }

    return {
      ...response,
      encrypted: false
    };
  }

  private async createEncryptedResponse(response: any) {
    if (this.mockEncryptionKey) {
      try {
        const responseIv = await generateIv();
        const { encryptedData: encryptedResponse } = await encrypt(response.message, this.mockEncryptionKey, responseIv);
        const encryptedResponseBase64 = arrayBufferToBase64(encryptedResponse);
        const responseIvBase64 = arrayBufferToBase64(responseIv.buffer);

        return {
          id: response.id,
          message: response.message,
          encryptedData: encryptedResponseBase64,
          iv: responseIvBase64,
          sender: 'ai',
          timestamp: response.timestamp,
          messageType: response.messageType,
          encrypted: true
        };
      } catch (error) {
        this.logToConsole('❌ SERVER: Response Encryption Failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'error', 'Failed to encrypt response');
      }
    }

    return {
      ...response,
      encrypted: false
    };
  }

  private getMockResponse(userMessage: string): string {
    const responses = [
      "I understand your concern. Based on your symptoms, I'd recommend consulting with a healthcare professional for a proper diagnosis.",
      "Thank you for sharing that information. Let me help you find the best treatment options available.",
      "I've found some relevant information that might help. Would you like me to show you nearby specialists?",
      "Based on your medical history, here are some recommendations that might be helpful.",
      "That's a great question about your health. Let me provide you with some evidence-based information.",
      "I can help you understand your symptoms better. Here's what you should know about this condition.",
      "For your safety, I recommend discussing this with a qualified healthcare provider who can examine you properly.",
      "Here are some general wellness tips that might be beneficial for your situation."
    ];
    
    // Simple keyword-based response selection
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
      return "I understand you're experiencing pain. While I can provide general information, it's important to consult with a healthcare professional for proper pain management and diagnosis.";
    }
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return "Fever can be a sign of various conditions. Please monitor your temperature and consider consulting a healthcare provider if it persists or is accompanied by other concerning symptoms.";
    }
    if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
      return "When it comes to medications, it's crucial to consult with a pharmacist or healthcare provider. They can provide proper guidance on dosage, interactions, and side effects.";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const apiClient = new ApiClient();