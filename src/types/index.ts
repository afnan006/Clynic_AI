// Re-export types from modular API structure
export type { User, AuthState, SignInResponse, OTPResponse } from '../api/auth/types';
export type { Assessment, AssessmentPayload, AssessmentResponse } from '../api/assessment/types';
export type { 
  Message, 
  Doctor, 
  Medicine, 
  Hospital, 
  QuestionData, 
  QuestionOption,
  ChatMessagePayload,
  ChatResponse
} from '../api/chat/types';
export type { 
  AppNotification, 
  NotificationAction, 
  NotificationSettings,
  MedicineReminderConfig,
  AppointmentReminderConfig,
  PharmacyReminderConfig,
  WaterReminderConfig
} from '../api/notifications/types';
export type { 
  PaymentDetails, 
  UpiApp, 
  PaymentModalProps,
  PaymentRequest,
  PaymentResponse
} from '../api/payment/types';