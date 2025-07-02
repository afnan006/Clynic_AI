export interface QuestionOption {
  label: string;
  value: string;
  icon?: string;
  color?: string;
}

export interface QuestionData {
  text: string;
  options: QuestionOption[];
  questionType?: 'single_choice' | 'multiple_choice' | 'text_input';
  placeholder?: string;
  required?: boolean;
  context?: Record<string, any>;
}

export interface AttachmentPreview {
  name: string;
  type: string;
  size: number;
  preview?: string;
}

export interface Message {
  id: string;
  userId: string;
  sender: 'user' | 'ai';
  message: string;
  mediaUrl?: string;
  messageType: 'text' | 'image' | 'card' | 'calendar' | 'system' | 'component' | 'question';
  timestamp: Date;
  componentType?: 'doctors' | 'medicines' | 'location';
  componentProps?: any;
  questionData?: QuestionData;
  encryptedData?: string;
  iv?: string;
  encrypted?: boolean;
  showMedicines?: boolean;
  followUpQuestion?: QuestionData;
  attachments?: AttachmentPreview[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  profilePic: string;
  rating: number;
  experience: number;
  consultationFee: number;
}

export interface Medicine {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  dosage: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  image: string;
  distance: number;
  rating: number;
  phone: string;
  lat: number;
  lng: number;
}

export interface ChatMessagePayload {
  encryptedData: string;
  iv: string;
  userId: string;
  timestamp: string;
  encrypted: boolean;
}

export interface ChatResponse {
  id: string;
  message: string;
  encryptedData?: string;
  iv?: string;
  sender: 'ai';
  timestamp: Date;
  messageType: string;
  encrypted: boolean;
  questionData?: QuestionData;
  showMedicines?: boolean;
}