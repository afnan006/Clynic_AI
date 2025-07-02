import { ChatMessagePayload, ChatResponse } from '../chat/types';
import { generateIv, encrypt, decrypt, arrayBufferToBase64, base64ToArrayBuffer } from '../../utils/encryption';

class MockChatApi {
  private conversationStates: Map<string, any> = new Map();

  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('CHAT_API', action, {
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

  private getConversationState(userId: string): any {
    if (!this.conversationStates.has(userId)) {
      this.conversationStates.set(userId, {
        step: 0,
        symptoms: []
      });
    }
    return this.conversationStates.get(userId)!;
  }

  private updateConversationState(userId: string, updates: any) {
    const current = this.getConversationState(userId);
    this.conversationStates.set(userId, { ...current, ...updates });
  }

  private resetConversationState(userId: string) {
    this.conversationStates.delete(userId);
  }

  private async getLocationWeather(): Promise<{ location: string; temperature: number }> {
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

    return null;
  }

  private generatePaymentResponse(userMessage: string): any {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for payment-related keywords
    if (lowerMessage.includes('pay') || lowerMessage.includes('payment') || lowerMessage.includes('transaction')) {
      // Extract amount if present
      let amount = 100; // Default amount
      const amountMatch = lowerMessage.match(/\d+/);
      if (amountMatch) {
        amount = parseInt(amountMatch[0]);
      }
      
      this.logToConsole('Payment Request Detected', {
        message: userMessage,
        extractedAmount: amount
      }, 'info', `User requested payment of ${amount}`);
      
      return {
        id: Date.now().toString(),
        message: `I'll help you process a payment of ₹${amount}. Please click the button below to proceed with the payment.`,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date(),
        // This will trigger the payment modal in the frontend
        paymentRequest: {
          amount: amount,
          reason: 'Chat Payment'
        }
      };
    }
    
    return null;
  }

  private generateDoctorResponse(userMessage: string): any {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for doctor-related keywords
    if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist') || 
        lowerMessage.includes('physician') || lowerMessage.includes('consultation')) {
      
      this.logToConsole('Doctor Request Detected', {
        message: userMessage
      }, 'info', `User requested doctor information`);
      
      return {
        id: Date.now().toString(),
        message: `Here are some recommended doctors who can help with your condition:`,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date(),
        componentType: 'doctors'
      };
    }
    
    return null;
  }

  private generateMedicineResponse(userMessage: string): any {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for medicine-related keywords
    if (lowerMessage.includes('medicine') || lowerMessage.includes('medication') || 
        lowerMessage.includes('drug') || lowerMessage.includes('pill') || 
        lowerMessage.includes('prescription')) {
      
      this.logToConsole('Medicine Request Detected', {
        message: userMessage
      }, 'info', `User requested medicine information`);
      
      return {
        id: Date.now().toString(),
        message: `Here are some recommended medications that might help with your condition. Please consult with a healthcare provider before taking any medication:`,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date(),
        showMedicines: true
      };
    }
    
    return null;
  }

  private generateHospitalResponse(userMessage: string): any {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for hospital-related keywords
    if (lowerMessage.includes('hospital') || lowerMessage.includes('location') || 
        lowerMessage.includes('nearby') || lowerMessage.includes('directions') || 
        lowerMessage.includes('emergency')) {
      
      this.logToConsole('Hospital Request Detected', {
        message: userMessage
      }, 'info', `User requested hospital information`);
      
      return {
        id: Date.now().toString(),
        message: `I've found some hospitals near your location:`,
        messageType: 'text',
        sender: 'ai',
        timestamp: new Date(),
        componentType: 'location'
      };
    }
    
    return null;
  }

  private getMockResponse(userMessage: string): string {
    // For general responses when no specific component is triggered
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

  async sendMessage(messageInput: { encryptedData: string; iv: string; originalMessage?: string }, clientEncryptionKey: CryptoKey): Promise<ChatResponse> {
    const startTime = performance.now();
    const userId = this.getUserId();
    
    // Get key identifier for debugging
    const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
    
    // Verify that we have encrypted data
    if (!messageInput.encryptedData || !messageInput.iv) {
      this.logToConsole('❌ SERVER: Invalid Encrypted Message', {
        error: 'Missing encryptedData or IV',
        securityViolation: true
      }, 'error', 'Rejected message due to missing encryption data');
      
      throw new Error('End-to-end encryption is required. Message must include encrypted data and IV.');
    }
    
    this.logToConsole('🌐 SERVER: Received Encrypted Message', {
      encryptedDataLength: messageInput.encryptedData.length,
      ivLength: messageInput.iv.length,
      hasOriginalMessage: !!messageInput.originalMessage,
      serverProcessingStart: new Date().toISOString(),
      clientKeyId: keyId // Log the client key ID
    }, 'info', `Server received encrypted message from client using key ${keyId}`);

    // For demo purposes, we'll use the original message provided by the client
    // In a real E2EE system, the server wouldn't be able to decrypt the message
    let decryptedMessage = messageInput.originalMessage || 'Encrypted message received';
    
    if (!decryptedMessage && messageInput.originalMessage !== "") {
      this.logToConsole('⚠️ SERVER DEMO: No Original Message', {
        note: 'In real E2EE, server cannot read messages',
        fallbackUsed: true,
        clientKeyId: keyId
      }, 'warn', 'Server using fallback message as original message is missing');
    } else {
      this.logToConsole('🔓 SERVER DEMO: Message Simulation', {
        note: 'This is only for demo purposes',
        messagePreview: decryptedMessage.substring(0, 30) + '...',
        clientKeyId: keyId
      }, 'info', `Server simulating message processing with client key ${keyId} (in real E2EE, server cannot read messages)`);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Process the message to determine the appropriate response
    let aiResponse;
    
    // Check for symptom checker flow first
    const symptomResponse = this.generateSymptomCheckerResponse(decryptedMessage, userId);
    if (symptomResponse) {
      const response = await symptomResponse;
      
      // Handle follow-up questions
      if (response.followUpQuestion) {
        return this.createEncryptedQuestionResponse(response, response.followUpQuestion, clientEncryptionKey);
      }
      
      // Handle medicine suggestions
      if (response.showMedicines) {
        return this.createEncryptedResponseWithMedicines(response, clientEncryptionKey);
      }
      
      return this.createEncryptedResponse(response, clientEncryptionKey);
    }
    
    // Check for payment-related messages
    const paymentResponse = this.generatePaymentResponse(decryptedMessage);
    if (paymentResponse) {
      return this.createEncryptedResponse(paymentResponse, clientEncryptionKey);
    }
    
    // Check for doctor-related messages
    const doctorResponse = this.generateDoctorResponse(decryptedMessage);
    if (doctorResponse) {
      return this.createEncryptedResponse(doctorResponse, clientEncryptionKey);
    }
    
    // Check for medicine-related messages
    const medicineResponse = this.generateMedicineResponse(decryptedMessage);
    if (medicineResponse) {
      return this.createEncryptedResponseWithMedicines(medicineResponse, clientEncryptionKey);
    }
    
    // Check for hospital-related messages
    const hospitalResponse = this.generateHospitalResponse(decryptedMessage);
    if (hospitalResponse) {
      return this.createEncryptedResponse(hospitalResponse, clientEncryptionKey);
    }
    
    // If no specific response was generated, use a generic response
    aiResponse = this.getMockResponse(decryptedMessage);
    const totalTime = performance.now() - startTime;

    const result = {
      id: Date.now().toString(),
      message: aiResponse,
      messageType: 'text',
      sender: 'ai',
      timestamp: new Date()
    };

    this.logToConsole('📤 SERVER: Preparing Response', {
      responseId: result.id,
      responseLength: aiResponse.length,
      totalServerTimeMs: totalTime.toFixed(2),
      encrypted: true,
      clientKeyId: keyId,
      isTestMode: false
    }, 'success', `Server preparing response using client key ${keyId}`);
    
    return this.createEncryptedResponse(result, clientEncryptionKey);
  }

  private async createEncryptedResponse(response: any, clientEncryptionKey: CryptoKey): Promise<ChatResponse> {
    try {
      // Get key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      
      const responseEncryptionStart = performance.now();
      
      // Generate new IV for response
      const responseIv = await generateIv();
      
      // Log detailed information about the encryption key
      this.logToConsole('🔑 SERVER: Using Client Key for Encryption', {
        keyId: keyId,
        keyType: clientEncryptionKey.type,
        keyAlgorithm: clientEncryptionKey.algorithm,
        keyUsages: clientEncryptionKey.usages,
        responseMessage: response.message.substring(0, 30) + '...',
        ivBase64: arrayBufferToBase64(responseIv.buffer)
      }, 'info', `Server preparing to encrypt response using client key ${keyId}`);
      
      // Encrypt AI response using the client's key
      const { encryptedData: encryptedResponse } = await encrypt(response.message, clientEncryptionKey, responseIv);
      
      // Convert to Base64 for transmission
      const encryptedResponseBase64 = arrayBufferToBase64(encryptedResponse);
      const responseIvBase64 = arrayBufferToBase64(responseIv.buffer);
      
      const responseEncryptionTime = performance.now() - responseEncryptionStart;
      
      this.logToConsole('🔐 SERVER: Response Encryption Complete', {
        originalResponseLength: response.message.length,
        encryptedResponseLength: encryptedResponse.byteLength,
        responseEncryptionTimeMs: responseEncryptionTime.toFixed(2),
        algorithm: 'AES-256-GCM',
        ivBase64Preview: responseIvBase64.substring(0, 10) + '...',
        encryptedDataBase64Preview: encryptedResponseBase64.substring(0, 20) + '...',
        clientKeyId: keyId
      }, 'success', `Server encrypted response of ${response.message.length} characters in ${responseEncryptionTime.toFixed(0)}ms using client key ${keyId}`);

      return {
        id: response.id,
        message: response.message,
        encryptedData: encryptedResponseBase64,
        iv: responseIvBase64,
        sender: 'ai',
        timestamp: response.timestamp,
        messageType: response.messageType || 'text',
        encrypted: true,
        questionData: response.questionData,
        showMedicines: response.showMedicines,
        componentType: response.componentType,
        paymentRequest: response.paymentRequest
      };
      
    } catch (error) {
      // Get key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      
      this.logToConsole('❌ SERVER: Response Encryption Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientKeyId: keyId,
        keyType: clientEncryptionKey.type,
        keyAlgorithm: clientEncryptionKey.algorithm,
        keyUsages: clientEncryptionKey.usages
      }, 'error', `Failed to encrypt response with client key ${keyId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to plain text - should never happen in enhanced security implementation
      this.logToConsole('⚠️ SERVER: Fallback to Plain Text Response', {
        reason: 'Encryption failed',
        securityWarning: true,
        clientKeyId: keyId
      }, 'warn', 'Server had to use plain text response due to encryption failure');

      return {
        ...response,
        encrypted: false
      };
    }
  }

  private async createEncryptedQuestionResponse(response: any, questionData: any, clientEncryptionKey: CryptoKey): Promise<ChatResponse> {
    try {
      // Get key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      
      const responseEncryptionStart = performance.now();
      
      // Generate new IV for response
      const responseIv = await generateIv();
      
      // Encrypt AI response using the client's key
      const { encryptedData: encryptedResponse } = await encrypt(response.message, clientEncryptionKey, responseIv);
      
      // Convert to Base64 for transmission
      const encryptedResponseBase64 = arrayBufferToBase64(encryptedResponse);
      const responseIvBase64 = arrayBufferToBase64(responseIv.buffer);
      
      const responseEncryptionTime = performance.now() - responseEncryptionStart;
      
      this.logToConsole('🔐 SERVER: Question Response Encrypted', {
        originalResponseLength: response.message.length,
        encryptedResponseLength: encryptedResponse.byteLength,
        hasQuestionData: !!questionData,
        responseEncryptionTimeMs: responseEncryptionTime.toFixed(2),
        clientKeyId: keyId
      }, 'success', `Server encrypted question response with follow-up question using client key ${keyId}`);

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
      // Get key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      
      this.logToConsole('❌ SERVER: Question Response Encryption Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientKeyId: keyId
      }, 'error', `Failed to encrypt question response with client key ${keyId}`);
      
      // Fallback to plain text
      return {
        ...response,
        messageType: 'question',
        questionData: questionData,
        encrypted: false
      };
    }
  }

  private async createEncryptedResponseWithMedicines(response: any, clientEncryptionKey: CryptoKey): Promise<ChatResponse> {
    try {
      // Get key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      
      const responseIv = await generateIv();
      const { encryptedData: encryptedResponse } = await encrypt(response.message, clientEncryptionKey, responseIv);
      const encryptedResponseBase64 = arrayBufferToBase64(encryptedResponse);
      const responseIvBase64 = arrayBufferToBase64(responseIv.buffer);

      this.logToConsole('🔐 SERVER: Medicine Response Encrypted', {
        originalResponseLength: response.message.length,
        encryptedResponseLength: encryptedResponse.byteLength,
        clientKeyId: keyId
      }, 'success', `Server encrypted medicine response using client key ${keyId}`);

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
      // Get key identifier for debugging
      const keyId = (clientEncryptionKey as any).keyId || 'unknown_key';
      
      this.logToConsole('❌ SERVER: Medicine Response Encryption Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientKeyId: keyId
      }, 'error', `Failed to encrypt medicine response with client key ${keyId}`);
      
      return {
        ...response,
        encrypted: false
      };
    }
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<Message[]> {
    this.logToConsole('getChatHistory Started', { userId, limit }, 'info', `Retrieving chat history for user ${userId}`);
    
    try {
      // In real implementation: GET /chat/history?userId={userId}&limit={limit}
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock chat history
      const messages: Message[] = [];

      this.logToConsole('getChatHistory Success', {
        userId,
        messageCount: messages.length
      }, 'success', `Retrieved ${messages.length} messages for user ${userId}`);
      
      return messages;
    } catch (error) {
      this.logToConsole('getChatHistory Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve chat history for user ${userId}`);
      throw error;
    }
  }
}

export const mockChatApi = new MockChatApi();