import { axiosClient } from '../axiosInstance';
import { AssessmentPayload, AssessmentResponse } from './types';
import { USE_MOCK_API, API_ENDPOINTS, formatEndpoint } from '../config';
import { mockAssessmentApi } from '../mock/mockAssessmentApi';

class AssessmentApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ASSESSMENT_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async submitAssessment(payload: AssessmentPayload): Promise<AssessmentResponse> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAssessmentApi.submitAssessment(payload);
    }

    this.logToConsole('submitAssessment Started', { 
      hasEncryptedData: !!payload.encryptedData,
      hasIv: !!payload.iv,
      userId: payload.userId,
      encrypted: payload.encrypted,
      payloadKeys: Object.keys(payload),
      timestamp: payload.timestamp
    }, 'info', `Submitting ${payload.encrypted ? 'encrypted' : 'plain text'} health assessment for user ${payload.userId}`);
    
    try {
      const response = await axiosClient.post(API_ENDPOINTS.ASSESSMENT.SUBMIT, payload);
      
      this.logToConsole('submitAssessment Success', {
        assessmentId: response.data.assessmentId,
        encryptionVerified: response.data.encryptionVerified,
        userId: payload.userId,
        encrypted: payload.encrypted
      }, 'success', `Assessment successfully saved with ID ${response.data.assessmentId} ${payload.encrypted ? 'with full encryption' : 'in demo mode'}`);
      
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.logToConsole('submitAssessment Failed', {
        error: errorMessage,
        userId: payload.userId,
        encrypted: payload.encrypted,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }, 'error', `Failed to submit assessment for user ${payload.userId}: ${errorMessage}`);
      
      throw new Error(`Assessment submission failed: ${errorMessage}`);
    }
  }

  async getAssessment(assessmentId: string): Promise<Assessment> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAssessmentApi.getAssessment(assessmentId);
    }

    this.logToConsole('getAssessment Started', { assessmentId }, 'info', `Retrieving assessment ${assessmentId}`);
    
    try {
      const response = await axiosClient.get(formatEndpoint(API_ENDPOINTS.ASSESSMENT.GET_BY_ID, { id: assessmentId }));
      
      this.logToConsole('getAssessment Success', {
        assessmentId,
        userId: response.data.userId
      }, 'success', `Retrieved assessment ${assessmentId}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('getAssessment Failed', {
        assessmentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve assessment ${assessmentId}`);
      throw error;
    }
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockAssessmentApi.getUserAssessments(userId);
    }

    this.logToConsole('getUserAssessments Started', { userId }, 'info', `Retrieving assessments for user ${userId}`);
    
    try {
      const response = await axiosClient.get(formatEndpoint(API_ENDPOINTS.ASSESSMENT.GET_USER_ASSESSMENTS, { userId }));
      
      this.logToConsole('getUserAssessments Success', {
        userId,
        assessmentCount: response.data.length
      }, 'success', `Retrieved ${response.data.length} assessments for user ${userId}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('getUserAssessments Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve assessments for user ${userId}`);
      throw error;
    }
  }
}

export const assessmentApi = new AssessmentApi();