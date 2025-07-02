export interface NotificationAction {
  id: string;
  label: string;
  type: 'button' | 'input';
  style?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  placeholder?: string;
}

export interface AppNotification {
  id: string;
  type: 'medicine_reminder' | 'appointment_confirmed' | 'order_update' | 'interactive_message' | 'system_alert';
  title: string;
  message: string;
  timestamp: Date;
  userId?: string;
  
  icon?: string;
  image?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  persistent?: boolean;
  autoHide?: boolean;
  hideAfter?: number;
  
  actions?: NotificationAction[];
  requiresResponse?: boolean;
  
  clickAction?: {
    type: 'navigate' | 'callback' | 'external';
    target: string;
    data?: any;
  };
  
  scheduledFor?: Date;
  recurring?: {
    interval: 'daily' | 'weekly' | 'monthly';
    times?: string[];
    daysOfWeek?: number[];
    endDate?: Date;
  };
  
  status: 'pending' | 'delivered' | 'read' | 'dismissed' | 'responded';
  deliveredAt?: Date;
  readAt?: Date;
  dismissedAt?: Date;
  response?: {
    actionId: string;
    value: string;
    timestamp: Date;
  };
  
  data?: Record<string, any>;
}

export interface MedicineReminderConfig {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: number;
  times: string[];
  enabled: boolean;
  createdAt: Date;
}

export interface AppointmentReminderConfig {
  id: string;
  doctorName: string;
  appointmentType: 'online' | 'offline';
  appointmentDate: Date;
  appointmentTime: string;
  reminderMinutes: number;
  allowReschedule: boolean;
  enabled: boolean;
  createdAt: Date;
}

export interface PharmacyReminderConfig {
  id: string;
  medicineName: string;
  purchaseDate: Date;
  expiryDate: Date;
  reminderDaysBefore: number;
  enabled: boolean;
  createdAt: Date;
}

export interface WaterReminderConfig {
  id: string;
  dailyGoal: number;
  reminderInterval: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
  currentIntake: number;
  lastResetDate: Date;
  createdAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  medicineReminders: boolean;
  appointmentUpdates: boolean;
  orderUpdates: boolean;
  interactiveMessages: boolean;
  systemAlerts: boolean;
  
  healthCheckupEnabled: boolean;
  healthCheckupFrequency: 'daily' | 'weekly' | 'monthly';
  healthCheckupTime: string;
  
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  medicineRemindersConfig: MedicineReminderConfig[];
  appointmentRemindersConfig: AppointmentReminderConfig[];
  pharmacyRemindersConfig: PharmacyReminderConfig[];
  waterReminderConfig: WaterReminderConfig | null;
  
  pushSubscription?: PushSubscription;
}