export interface Assessment {
  id: string;
  userId: string;
  name: string;
  age: number;
  phone: string;
  hasDiabetes: boolean;
  hasBloodPressure: boolean;
  createdAt: Date;
}

export interface AssessmentPayload {
  encryptedData?: string;
  iv?: string;
  userId: string;
  timestamp: string;
  encrypted: boolean;
  // Plain text fields for demo mode
  name?: string;
  age?: number;
  phone?: string;
  hasDiabetes?: boolean;
  hasBloodPressure?: boolean;
}

export interface AssessmentResponse {
  success: boolean;
  message: string;
  assessmentId: string;
  encryptionVerified: boolean;
  timestamp: string;
}