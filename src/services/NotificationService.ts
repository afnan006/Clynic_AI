import { AppNotification, NotificationSettings, NotificationAction, MedicineReminderConfig, AppointmentReminderConfig, PharmacyReminderConfig, WaterReminderConfig } from '../api/notifications/types';
import { notificationApi } from '../api/notifications/notificationApi';

export interface NotificationServiceConfig {
  vapidPublicKey?: string;
  defaultSettings?: Partial<NotificationSettings>;
}

class NotificationService {
  private notifications: AppNotification[] = [];
  private settings: NotificationSettings;
  private listeners: Set<(notifications: AppNotification[]) => void> = new Set();
  private settingsListeners: Set<(settings: NotificationSettings) => void> = new Set();
  private scheduledTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private waterReminderTimeoutId: NodeJS.Timeout | null = null;
  private config: NotificationServiceConfig;
  private enableVerboseLogging: boolean = false;

  constructor(config: NotificationServiceConfig = {}) {
    this.config = config;
    this.settings = {
      enabled: true,
      pushEnabled: false,
      inAppEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      medicineReminders: true,
      appointmentUpdates: true,
      orderUpdates: true,
      interactiveMessages: true,
      systemAlerts: true,
      healthCheckupEnabled: false,
      healthCheckupFrequency: 'weekly',
      healthCheckupTime: '14:00',
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      medicineRemindersConfig: [],
      appointmentRemindersConfig: [],
      pharmacyRemindersConfig: [],
      waterReminderConfig: null,
      ...config.defaultSettings
    };

    this.loadSettings();
    this.initializeServiceWorker();
    this.logToConsole('NotificationService Initialized', {
      inAppEnabled: this.settings.inAppEnabled,
      pushEnabled: this.settings.pushEnabled,
      hasVapidKey: !!this.config.vapidPublicKey
    }, 'success', 'Notification service is ready to handle all types of notifications');
  }

  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    // Only log if verbose logging is enabled, or if the level is error or warn
    if (typeof window !== 'undefined' && (window as any).devConsole && 
        (this.enableVerboseLogging || level === 'error' || level === 'warn')) {
      (window as any).devConsole.log('NOTIFICATIONS', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  // Settings Management
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      this.logToConsole('Failed to Load Settings', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'warn', 'Using default notification settings instead');
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('notification_settings', JSON.stringify(this.settings));
      this.notifySettingsListeners();
    } catch (error) {
      this.logToConsole('Failed to Save Settings', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Notification settings could not be saved');
    }
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    
    this.logToConsole('Settings Updated', {
      updatedFields: Object.keys(updates),
      newSettings: this.settings
    }, 'info', `Updated notification preferences: ${Object.keys(updates).join(', ')}`);
  }

  // Listener Management
  public subscribe(listener: (notifications: AppNotification[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.notifications); // Send current state immediately
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeToSettings(listener: (settings: NotificationSettings) => void): () => void {
    this.settingsListeners.add(listener);
    listener(this.settings); // Send current state immediately
    
    return () => {
      this.settingsListeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private notifySettingsListeners(): void {
    this.settingsListeners.forEach(listener => listener({ ...this.settings }));
  }

  // Core Notification Management
  public addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'status'>): string {
    if (!this.settings.enabled || !this.settings.inAppEnabled) {
      this.logToConsole('Notification Blocked', {
        reason: !this.settings.enabled ? 'Notifications disabled' : 'In-app notifications disabled',
        type: notification.type
      }, 'warn', 'Notification was blocked due to user preferences');
      return '';
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      this.logToConsole('Notification Delayed', {
        reason: 'Quiet hours active',
        type: notification.type,
        quietHoursStart: this.settings.quietHoursStart,
        quietHoursEnd: this.settings.quietHoursEnd
      }, 'info', 'Notification delayed due to quiet hours setting');
      
      // Schedule for after quiet hours
      this.scheduleAfterQuietHours(notification);
      return '';
    }

    const fullNotification: AppNotification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      status: 'delivered',
      deliveredAt: new Date()
    };

    this.notifications.unshift(fullNotification);
    this.notifyListeners();

    // Handle auto-hide
    if (fullNotification.autoHide && fullNotification.hideAfter) {
      setTimeout(() => {
        this.removeNotification(fullNotification.id);
      }, fullNotification.hideAfter);
    }

    // Send push notification if enabled
    if (this.settings.pushEnabled) {
      this.sendPushNotification(fullNotification);
    }

    // Play sound if enabled
    if (this.settings.soundEnabled) {
      this.playNotificationSound(fullNotification.priority);
    }

    // Vibrate if enabled and supported
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      this.vibrateDevice(fullNotification.priority);
    }

    this.logToConsole('Notification Added', {
      id: fullNotification.id,
      type: fullNotification.type,
      title: fullNotification.title,
      priority: fullNotification.priority,
      hasActions: !!fullNotification.actions?.length,
      autoHide: fullNotification.autoHide
    }, 'success', `New ${fullNotification.type} notification: "${fullNotification.title}"`);

    return fullNotification.id;
  }

  public removeNotification(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      this.notifications.splice(index, 1);
      this.notifyListeners();
      
      this.logToConsole('Notification Removed', {
        id,
        type: notification.type,
        wasRead: !!notification.readAt
      }, 'info', `Removed notification: "${notification.title}"`);
    }
  }

  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && notification.status !== 'read') {
      notification.status = 'read';
      notification.readAt = new Date();
      this.notifyListeners();
      
      this.logToConsole('Notification Read', {
        id,
        type: notification.type,
        title: notification.title
      }, 'info', `User read notification: "${notification.title}"`);
    }
  }

  public dismissNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'dismissed';
      notification.dismissedAt = new Date();
      this.removeNotification(id);
      
      this.logToConsole('Notification Dismissed', {
        id,
        type: notification.type,
        title: notification.title
      }, 'info', `User dismissed notification: "${notification.title}"`);
    }
  }

  public handleAction(notificationId: string, actionId: string, value?: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) return;

    notification.response = {
      actionId,
      value: value || action.label,
      timestamp: new Date()
    };
    notification.status = 'responded';

    this.logToConsole('Notification Action Handled', {
      notificationId,
      actionId,
      actionLabel: action.label,
      value,
      notificationType: notification.type
    }, 'success', `User responded to notification with: "${value || action.label}"`);

    // Handle specific action types
    this.processActionResponse(notification, action, value);

    // Remove notification after response if not persistent
    if (!notification.persistent) {
      setTimeout(() => this.removeNotification(notificationId), 1000);
    }

    this.notifyListeners();
  }

  private processActionResponse(notification: AppNotification, action: NotificationAction, value?: string): void {
    // Handle navigation to chat for interactive messages
    if (notification.type === 'interactive_message' && notification.clickAction) {
      if (notification.clickAction.type === 'navigate' && notification.clickAction.target === '/chat') {
        // Add response as a new message in chat
        this.addChatResponse(notification, action, value);
      }
    }

    // Handle medicine reminder responses
    if (notification.type === 'medicine_reminder') {
      this.handleMedicineReminderResponse(notification, action, value);
    }

    // Handle appointment confirmations
    if (notification.type === 'appointment_confirmed') {
      this.handleAppointmentResponse(notification, action, value);
    }
  }

  private addChatResponse(notification: AppNotification, action: NotificationAction, value?: string): void {
    // This would integrate with your chat system
    const responseMessage = value || action.label;
    
    this.logToConsole('Chat Response Added', {
      originalNotification: notification.title,
      response: responseMessage,
      notificationId: notification.id
    }, 'info', `Added user response to chat: "${responseMessage}"`);

    // You would call your chat service here to add the message
    // Example: chatService.addMessage(responseMessage, 'user');
  }

  private handleMedicineReminderResponse(notification: AppNotification, action: NotificationAction, value?: string): void {
    const medicineName = notification.data?.medicineName || 'medication';
    
    if (action.id === 'taken') {
      this.logToConsole('Medicine Taken', {
        medicine: medicineName,
        time: new Date().toISOString(),
        notificationId: notification.id
      }, 'success', `User confirmed taking ${medicineName}`);
      
      // Schedule next reminder if recurring
      if (notification.recurring) {
        this.scheduleRecurringNotification(notification);
      }
    } else if (action.id === 'skip') {
      this.logToConsole('Medicine Skipped', {
        medicine: medicineName,
        reason: value,
        time: new Date().toISOString(),
        notificationId: notification.id
      }, 'warn', `User skipped ${medicineName}${value ? `: ${value}` : ''}`);
    }
  }

  private handleAppointmentResponse(notification: AppNotification, action: NotificationAction, value?: string): void {
    const appointmentData = notification.data;
    
    this.logToConsole('Appointment Response', {
      appointmentId: appointmentData?.appointmentId,
      doctorName: appointmentData?.doctorName,
      response: action.id,
      value,
      notificationId: notification.id
    }, 'info', `User responded to appointment notification: ${action.label}`);
  }

  // Scheduling
  public scheduleNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'status'>, delayMs: number): string {
    const id = this.generateId();
    
    const timeout = setTimeout(() => {
      this.addNotification(notification);
      this.scheduledTimeouts.delete(id);
    }, delayMs);

    this.scheduledTimeouts.set(id, timeout);

    this.logToConsole('Notification Scheduled', {
      id,
      type: notification.type,
      delayMs,
      scheduledFor: new Date(Date.now() + delayMs).toISOString()
    }, 'info', `Scheduled ${notification.type} notification for ${Math.round(delayMs / 1000)} seconds from now`);

    return id;
  }

  public cancelScheduledNotification(id: string): void {
    const timeout = this.scheduledTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledTimeouts.delete(id);
      
      this.logToConsole('Scheduled Notification Cancelled', {
        id
      }, 'info', 'Cancelled a scheduled notification');
    }
  }

  private scheduleRecurringNotification(originalNotification: AppNotification): void {
    if (!originalNotification.recurring) return;

    const { interval, times, daysOfWeek } = originalNotification.recurring;
    let nextTime: Date | null = null;

    const now = new Date();

    if (interval === 'daily' && times) {
      // Find next time today or tomorrow
      for (const timeStr of times) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const candidate = new Date(now);
        candidate.setHours(hours, minutes, 0, 0);
        
        if (candidate > now) {
          nextTime = candidate;
          break;
        }
      }
      
      // If no time today, use first time tomorrow
      if (!nextTime && times.length > 0) {
        const [hours, minutes] = times[0].split(':').map(Number);
        nextTime = new Date(now);
        nextTime.setDate(nextTime.getDate() + 1);
        nextTime.setHours(hours, minutes, 0, 0);
      }
    }

    if (nextTime) {
      const delayMs = nextTime.getTime() - now.getTime();
      this.scheduleNotification({
        ...originalNotification,
        scheduledFor: nextTime
      }, delayMs);

      this.logToConsole('Recurring Notification Scheduled', {
        originalId: originalNotification.id,
        nextTime: nextTime.toISOString(),
        interval,
        delayMs
      }, 'info', `Next ${originalNotification.type} reminder scheduled for ${nextTime.toLocaleString()}`);
    }
  }

  private scheduleAfterQuietHours(notification: Omit<AppNotification, 'id' | 'timestamp' | 'status'>): void {
    const now = new Date();
    const endTime = this.parseTime(this.settings.quietHoursEnd);
    
    let nextDelivery = new Date(now);
    nextDelivery.setHours(endTime.hours, endTime.minutes, 0, 0);
    
    // If end time is tomorrow
    if (nextDelivery <= now) {
      nextDelivery.setDate(nextDelivery.getDate() + 1);
    }

    const delayMs = nextDelivery.getTime() - now.getTime();
    this.scheduleNotification(notification, delayMs);
  }

  // Utility Methods
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const start = this.parseTime(this.settings.quietHoursStart);
    const end = this.parseTime(this.settings.quietHoursEnd);
    
    const startMinutes = start.hours * 60 + start.minutes;
    const endMinutes = end.hours * 60 + end.minutes;

    if (startMinutes < endMinutes) {
      // Same day range (e.g., 14:00 to 18:00)
      return currentTime >= startMinutes && currentTime < endMinutes;
    } else {
      // Overnight range (e.g., 22:00 to 08:00)
      return currentTime >= startMinutes || currentTime < endMinutes;
    }
  }

  private parseTime(timeStr: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  private playNotificationSound(priority: AppNotification['priority']): void {
    try {
      // Different sounds for different priorities
      const soundMap = {
        low: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
        normal: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
        high: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT',
        urgent: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
      };

      const audio = new Audio(soundMap[priority] || soundMap.normal);
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }

  private vibrateDevice(priority: AppNotification['priority']): void {
    const vibrationPatterns = {
      low: [100],
      normal: [200],
      high: [100, 100, 200],
      urgent: [200, 100, 200, 100, 200]
    };

    navigator.vibrate(vibrationPatterns[priority] || vibrationPatterns.normal);
  }

  // Push Notifications
  private async initializeServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      this.logToConsole('Push Notifications Not Supported', {
        hasServiceWorker: 'serviceWorker' in navigator,
        hasPushManager: 'PushManager' in window
      }, 'warn', 'This browser does not support push notifications');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      this.logToConsole('Service Worker Registered', {
        scope: registration.scope
      }, 'success', 'Service worker is ready for push notifications');
    } catch (error) {
      this.logToConsole('Service Worker Registration Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Failed to register service worker for push notifications');
    }
  }

  public async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      this.logToConsole('Notifications Not Supported', {}, 'warn', 'This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      this.logToConsole('Notification Permission Denied', {}, 'warn', 'User has denied notification permissions');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      this.logToConsole('Notification Permission Requested', {
        permission,
        granted
      }, granted ? 'success' : 'warn', granted ? 'User granted notification permissions' : 'User denied notification permissions');
      
      return granted;
    } catch (error) {
      this.logToConsole('Permission Request Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Failed to request notification permissions');
      return false;
    }
  }

  public async subscribeToPushNotifications(): Promise<boolean> {
    if (!this.config.vapidPublicKey) {
      this.logToConsole('VAPID Key Missing', {}, 'error', 'Cannot subscribe to push notifications without VAPID public key');
      return false;
    }

    try {
      const hasPermission = await this.requestPushPermission();
      if (!hasPermission) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
      });

      // Store subscription
      this.settings.pushSubscription = subscription;
      this.settings.pushEnabled = true;
      this.saveSettings();

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      this.logToConsole('Push Subscription Created', {
        endpoint: subscription.endpoint,
        hasKeys: !!(subscription.keys && subscription.keys.p256dh && subscription.keys.auth)
      }, 'success', 'Successfully subscribed to push notifications');

      return true;
    } catch (error) {
      this.logToConsole('Push Subscription Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Failed to subscribe to push notifications');
      return false;
    }
  }

  public async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      if (this.settings.pushSubscription) {
        await this.settings.pushSubscription.unsubscribe();
        
        // Notify server
        await this.removeSubscriptionFromServer(this.settings.pushSubscription);
      }

      this.settings.pushSubscription = undefined;
      this.settings.pushEnabled = false;
      this.saveSettings();

      this.logToConsole('Push Unsubscription Complete', {}, 'success', 'Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      this.logToConsole('Push Unsubscription Failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Failed to unsubscribe from push notifications');
      return false;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const userId = this.getCurrentUserId() || 'anonymous';
      await notificationApi.subscribeToPush(subscription, userId);
    } catch (error) {
      this.logToConsole('Failed to Send Subscription to Server', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Could not register push subscription with server');
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const userId = this.getCurrentUserId() || 'anonymous';
      await notificationApi.unsubscribeFromPush(subscription.endpoint, userId);
    } catch (error) {
      this.logToConsole('Failed to Remove Subscription from Server', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', 'Could not remove push subscription from server');
    }
  }

  private async sendPushNotification(notification: AppNotification): Promise<void> {
    // This would typically be handled by your backend
    // For demo purposes, we'll show how the data would be structured
    const pushData = {
      title: notification.title,
      body: notification.message,
      icon: notification.icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: notification.id,
      data: {
        notificationId: notification.id,
        type: notification.type,
        clickAction: notification.clickAction,
        actions: notification.actions
      },
      actions: notification.actions?.map(action => ({
        action: action.id,
        title: action.label,
        icon: action.type === 'input' ? '/input-icon.png' : '/button-icon.png'
      }))
    };

    this.logToConsole('Push Notification Data Prepared', {
      notificationId: notification.id,
      hasActions: !!pushData.actions?.length,
      dataSize: JSON.stringify(pushData).length
    }, 'info', 'Push notification data is ready to be sent by the server');
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private getCurrentUserId(): string | null {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null;
  }

  // Convenience Methods for Common Notification Types
  public addMedicineReminder(medicineName: string, dosage: string, scheduledTime?: Date): string {
    return this.addNotification({
      type: 'medicine_reminder',
      title: `Time for ${medicineName}`,
      message: `Don't forget to take your ${medicineName} (${dosage})`,
      priority: 'high',
      icon: '💊',
      persistent: true,
      actions: [
        { id: 'taken', label: 'Taken', type: 'button', style: 'success' },
        { id: 'skip', label: 'Skip', type: 'button', style: 'secondary' },
        { id: 'snooze', label: 'Remind me in 15 min', type: 'button', style: 'primary' }
      ],
      data: { medicineName, dosage },
      recurring: {
        interval: 'daily',
        times: scheduledTime ? [scheduledTime.toTimeString().slice(0, 5)] : ['09:00', '21:00']
      }
    });
  }

  public addAppointmentConfirmation(doctorName: string, appointmentTime: Date, appointmentId: string): string {
    return this.addNotification({
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctorName} is confirmed for ${appointmentTime.toLocaleDateString()} at ${appointmentTime.toLocaleTimeString()}`,
      priority: 'normal',
      icon: '👨‍⚕️',
      autoHide: false,
      actions: [
        { id: 'view', label: 'View Details', type: 'button', style: 'primary' },
        { id: 'reschedule', label: 'Reschedule', type: 'button', style: 'secondary' },
        { id: 'cancel', label: 'Cancel', type: 'button', style: 'danger' }
      ],
      clickAction: {
        type: 'navigate',
        target: '/appointments',
        data: { appointmentId }
      },
      data: { doctorName, appointmentTime: appointmentTime.toISOString(), appointmentId }
    });
  }

  public addOrderUpdate(orderStatus: string, trackingNumber?: string, estimatedDelivery?: Date): string {
    const statusMessages = {
      confirmed: 'Your order has been confirmed and is being prepared',
      shipped: 'Your order is on the way!',
      delivered: 'Your order has been delivered',
      delayed: 'Your order has been delayed'
    };

    return this.addNotification({
      type: 'order_update',
      title: `Order ${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}`,
      message: statusMessages[orderStatus as keyof typeof statusMessages] || `Order status: ${orderStatus}`,
      priority: orderStatus === 'delivered' ? 'high' : 'normal',
      icon: orderStatus === 'delivered' ? '📦' : '🚚',
      autoHide: orderStatus === 'delivered',
      hideAfter: orderStatus === 'delivered' ? 10000 : undefined,
      actions: trackingNumber ? [
        { id: 'track', label: 'Track Package', type: 'button', style: 'primary' },
        { id: 'contact', label: 'Contact Support', type: 'button', style: 'secondary' }
      ] : undefined,
      data: { orderStatus, trackingNumber, estimatedDelivery: estimatedDelivery?.toISOString() }
    });
  }

  public addInteractiveMessage(question: string, quickReplies: string[], allowTextInput: boolean = true): string {
    const actions: NotificationAction[] = quickReplies.map((reply, index) => ({
      id: `reply_${index}`,
      label: reply,
      type: 'button',
      style: 'primary'
    }));

    if (allowTextInput) {
      actions.push({
        id: 'custom_reply',
        label: 'Type response',
        type: 'input',
        placeholder: 'Type your response...'
      });
    }

    return this.addNotification({
      type: 'interactive_message',
      title: 'Health Check-in',
      message: question,
      priority: 'normal',
      icon: '💬',
      persistent: true,
      requiresResponse: true,
      actions,
      clickAction: {
        type: 'navigate',
        target: '/chat',
        data: { question }
      }
    });
  }

  public addSystemAlert(title: string, message: string, priority: AppNotification['priority'] = 'normal'): string {
    return this.addNotification({
      type: 'system_alert',
      title,
      message,
      priority,
      icon: priority === 'urgent' ? '🚨' : 'ℹ️',
      autoHide: priority !== 'urgent',
      hideAfter: priority === 'low' ? 5000 : priority === 'normal' ? 8000 : undefined
    });
  }

  // New methods for reminder configurations
  public scheduleMedicineReminder(config: MedicineReminderConfig): void {
    if (!config.enabled) return;

    config.times.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const delayMs = scheduledTime.getTime() - now.getTime();

      this.scheduleNotification({
        type: 'medicine_reminder',
        title: `Time for ${config.medicineName}`,
        message: `Don't forget to take your ${config.medicineName} (${config.dosage})`,
        priority: 'high',
        icon: '💊',
        persistent: true,
        actions: [
          { id: 'taken', label: 'Taken', type: 'button', style: 'success' },
          { id: 'skip', label: 'Skip', type: 'button', style: 'secondary' },
          { id: 'snooze', label: 'Remind me in 15 min', type: 'button', style: 'primary' }
        ],
        data: { medicineName: config.medicineName, dosage: config.dosage },
        recurring: {
          interval: 'daily',
          times: config.times
        }
      }, delayMs);
    });

    this.logToConsole('Medicine Reminder Scheduled', {
      medicineName: config.medicineName,
      frequency: config.frequency,
      times: config.times
    }, 'success', `Scheduled medicine reminder for ${config.medicineName}`);
  }

  public scheduleAppointmentReminder(config: AppointmentReminderConfig): void {
    if (!config.enabled) return;

    const reminderTime = new Date(config.appointmentDate.getTime() - (config.reminderMinutes * 60 * 1000));
    const now = new Date();

    if (reminderTime > now) {
      const delayMs = reminderTime.getTime() - now.getTime();

      this.scheduleNotification({
        type: 'appointment_confirmed',
        title: 'Upcoming Appointment',
        message: `Your appointment with Dr. ${config.doctorName} is in ${config.reminderMinutes} minutes`,
        priority: 'high',
        icon: '👨‍⚕️',
        persistent: true,
        actions: config.allowReschedule ? [
          { id: 'view', label: 'View Details', type: 'button', style: 'primary' },
          { id: 'reschedule', label: 'Reschedule', type: 'button', style: 'secondary' }
        ] : [
          { id: 'view', label: 'View Details', type: 'button', style: 'primary' }
        ],
        data: { 
          doctorName: config.doctorName, 
          appointmentTime: config.appointmentDate.toISOString(),
          appointmentType: config.appointmentType
        }
      }, delayMs);

      this.logToConsole('Appointment Reminder Scheduled', {
        doctorName: config.doctorName,
        appointmentDate: config.appointmentDate.toISOString(),
        reminderMinutes: config.reminderMinutes
      }, 'success', `Scheduled appointment reminder for Dr. ${config.doctorName}`);
    }
  }

  public schedulePharmacyReminder(config: PharmacyReminderConfig): void {
    if (!config.enabled) return;

    const reminderDate = new Date(config.expiryDate.getTime() - (config.reminderDaysBefore * 24 * 60 * 60 * 1000));
    const now = new Date();

    if (reminderDate > now) {
      const delayMs = reminderDate.getTime() - now.getTime();

      this.scheduleNotification({
        type: 'system_alert',
        title: 'Medicine Expiring Soon',
        message: `Your ${config.medicineName} will expire in ${config.reminderDaysBefore} days. Consider ordering a refill.`,
        priority: 'normal',
        icon: '⚠️',
        autoHide: false,
        actions: [
          { id: 'order', label: 'Order Refill', type: 'button', style: 'primary' },
          { id: 'remind_later', label: 'Remind Tomorrow', type: 'button', style: 'secondary' }
        ],
        data: { 
          medicineName: config.medicineName,
          expiryDate: config.expiryDate.toISOString(),
          reminderDaysBefore: config.reminderDaysBefore
        }
      }, delayMs);

      this.logToConsole('Pharmacy Reminder Scheduled', {
        medicineName: config.medicineName,
        expiryDate: config.expiryDate.toISOString(),
        reminderDaysBefore: config.reminderDaysBefore
      }, 'success', `Scheduled pharmacy reminder for ${config.medicineName}`);
    }
  }

  public scheduleWaterReminder(config: WaterReminderConfig): void {
    if (!config.enabled) return;

    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);

    // Clear any existing water reminder timeout
    if (this.waterReminderTimeoutId) {
      clearTimeout(this.waterReminderTimeoutId);
      this.waterReminderTimeoutId = null;
    }

    const scheduleNextReminder = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      // Check if we're within the active hours
      if (currentTime >= startTime && currentTime <= endTime) {
        // Schedule next reminder
        const nextReminderTime = new Date(now.getTime() + (config.reminderInterval * 60 * 1000));
        
        // Make sure next reminder is still within active hours
        const nextHour = nextReminderTime.getHours();
        const nextMinute = nextReminderTime.getMinutes();
        const nextTime = nextHour * 60 + nextMinute;

        if (nextTime <= endTime) {
          this.waterReminderTimeoutId = setTimeout(() => {
            this.addNotification({
              type: 'system_alert',
              title: 'Stay Hydrated! 💧',
              message: `Time for some water! You're at ${config.currentIntake}L of your ${config.dailyGoal}L goal.`,
              priority: 'low',
              icon: '💧',
              autoHide: true,
              hideAfter: 8000,
              actions: [
                { id: 'drank_250ml', label: '+250ml', type: 'button', style: 'primary' },
                { id: 'drank_500ml', label: '+500ml', type: 'button', style: 'primary' },
                { id: 'snooze', label: 'Remind later', type: 'button', style: 'secondary' }
              ],
              data: { 
                currentIntake: config.currentIntake,
                dailyGoal: config.dailyGoal,
                reminderType: 'water'
              }
            });
            
            // Schedule the next reminder
            scheduleNextReminder();
          }, config.reminderInterval * 60 * 1000);
        }
      }
    };

    scheduleNextReminder();

    this.logToConsole('Water Reminder Scheduled', {
      dailyGoal: config.dailyGoal,
      reminderInterval: config.reminderInterval,
      startTime: config.startTime,
      endTime: config.endTime
    }, 'success', `Scheduled water reminders every ${config.reminderInterval} minutes`);
  }

  // Cleanup
  public destroy(): void {
    // Clear all scheduled timeouts
    this.scheduledTimeouts.forEach(timeout => clearTimeout(timeout));
    this.scheduledTimeouts.clear();
    
    // Clear water reminder timeout
    if (this.waterReminderTimeoutId) {
      clearTimeout(this.waterReminderTimeoutId);
      this.waterReminderTimeoutId = null;
    }
    
    // Clear listeners
    this.listeners.clear();
    this.settingsListeners.clear();
    
    this.logToConsole('NotificationService Destroyed', {
      clearedTimeouts: this.scheduledTimeouts.size,
      clearedListeners: this.listeners.size
    }, 'info', 'Notification service has been cleaned up');
  }

  // Enable/disable verbose logging
  public setVerboseLogging(enabled: boolean): void {
    this.enableVerboseLogging = enabled;
    this.logToConsole('Verbose Logging Setting Changed', {
      enabled
    }, 'info', `Verbose logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService({
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
});

export default NotificationService;