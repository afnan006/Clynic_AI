import { axiosClient } from '../axiosInstance';
import { ChatMessagePayload, ChatResponse } from './types';
import { USE_MOCK_API, API_ENDPOINTS } from '../config';
import { mockChatApi } from '../mock/mockChatApi';

class ChatApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('CHAT_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async sendMessage(messageInput: { encryptedData: string; iv: string; originalMessage?: string }, clientEncryptionKey: CryptoKey): Promise<ChatResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockChatApi.sendMessage(messageInput, clientEncryptionKey);
    }

    const startTime = performance.now();
    
    // Verify that we have encrypted data
    if (!messageInput.encryptedData || !messageInput.iv) {
      this.logToConsole('❌ Invalid Encrypted Message', {
        error: 'Missing encryptedData or IV',
        securityViolation: true
      }, 'error', 'Rejected message due to missing encryption data');
      
      throw new Error('End-to-end encryption is required. Message must include encrypted data and IV.');
    }
    
    this.logToConsole('Sending Encrypted Message to Server', {
      encryptedDataLength: messageInput.encryptedData.length,
      ivLength: messageInput.iv.length,
      requestStart: new Date().toISOString()
    }, 'info', `Sending encrypted message to server`);

    try {
      // Prepare payload for server - do NOT include originalMessage in real API call
      const payload: ChatMessagePayload = {
        encryptedData: messageInput.encryptedData,
        iv: messageInput.iv,
        userId: this.getUserId(),
        timestamp: new Date().toISOString(),
        encrypted: true
      };

      // Send to server
      const response = await axiosClient.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, payload);
      const apiCallTime = performance.now() - startTime;

      this.logToConsole('Server Response Received', {
        responseId: response.data.id,
        apiLatencyMs: apiCallTime.toFixed(2),
        hasEncryptedResponse: !!(response.data.encryptedData && response.data.iv),
        responseType: response.data.encryptedData ? 'encrypted' : 'plain',
        messageType: response.data.messageType
      }, 'success', `Server responded in ${apiCallTime.toFixed(0)}ms with ${response.data.encryptedData ? 'an encrypted' : 'a plain text'} message`);

      return response.data;
    } catch (error) {
      this.logToConsole('Message Sending Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        totalLatencyMs: (performance.now() - startTime).toFixed(2)
      }, 'error', `Failed to send message to server`);
      
      throw error;
    }
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<Message[]> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockChatApi.getChatHistory(userId, limit);
    }

    this.logToConsole('getChatHistory Started', { userId, limit }, 'info', `Retrieving chat history for user ${userId}`);
    
    try {
      const response = await axiosClient.get(`${API_ENDPOINTS.CHAT.GET_HISTORY}?userId=${userId}&limit=${limit}`);
      
      this.logToConsole('getChatHistory Success', {
        userId,
        messageCount: response.data.length
      }, 'success', `Retrieved ${response.data.length} messages for user ${userId}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('getChatHistory Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve chat history for user ${userId}`);
      throw error;
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
}

export const chatApi = new ChatApi();