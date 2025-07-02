import { AssessmentPayload, AssessmentResponse } from '../assessment/types';

class MockAssessmentApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ASSESSMENT_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async submitAssessment(payload: AssessmentPayload): Promise<AssessmentResponse> {
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
      
      const result: AssessmentResponse = { 
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
      
      throw new Error(`Assessment submission failed: ${errorMessage}`);
    }
  }

  async getAssessment(assessmentId: string): Promise<Assessment> {
    this.logToConsole('getAssessment Started', { assessmentId }, 'info', `Retrieving assessment ${assessmentId}`);
    
    try {
      // In real implementation: GET /assessments/{assessmentId}
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock assessment data
      const assessment: Assessment = {
        id: assessmentId,
        userId: 'mock_user_id',
        name: 'John Doe',
        age: 30,
        phone: '+1234567890',
        hasDiabetes: false,
        hasBloodPressure: false,
        createdAt: new Date()
      };

      this.logToConsole('getAssessment Success', {
        assessmentId,
        userId: assessment.userId
      }, 'success', `Retrieved assessment ${assessmentId}`);
      
      return assessment;
    } catch (error) {
      this.logToConsole('getAssessment Failed', {
        assessmentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve assessment ${assessmentId}`);
      throw error;
    }
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    this.logToConsole('getUserAssessments Started', { userId }, 'info', `Retrieving assessments for user ${userId}`);
    
    try {
      // In real implementation: GET /users/{userId}/assessments
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock assessments list
      const assessments: Assessment[] = [];

      this.logToConsole('getUserAssessments Success', {
        userId,
        assessmentCount: assessments.length
      }, 'success', `Retrieved ${assessments.length} assessments for user ${userId}`);
      
      return assessments;
    } catch (error) {
      this.logToConsole('getUserAssessments Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve assessments for user ${userId}`);
      throw error;
    }
  }
}

export const mockAssessmentApi = new MockAssessmentApi();