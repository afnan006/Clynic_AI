import { NotificationSettings } from '../notifications/types';

class MockNotificationApi {
  // Track sent notification types
  private sentNotificationTypes = new Set<string>();

  private logToConsole(
    action: string,
    data: any,
    level: 'info' | 'warn' | 'error' | 'success' = 'info',
    normalDescription?: string
  ) {
    // Use action as the notification type key
    if (this.sentNotificationTypes.has(action)) {
      return; // Already sent this type, skip
    }
    this.sentNotificationTypes.add(action);

    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log(
        'NOTIFICATION_API',
        action,
        {
          ...data,
          timestamp: new Date().toISOString(),
        },
        level,
        normalDescription
      );
    }
  }

  async subscribeToPush(subscription: PushSubscription, userId: string): Promise<void> {
    this.logToConsole('subscribeToPush Started', { 
      endpoint: subscription.endpoint,
      userId 
    }, 'info', `Subscribing user ${userId} to push notifications`);
    
    try {
      // In real implementation: POST /notifications/push/subscribe
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.logToConsole('subscribeToPush Success', { 
        userId,
        endpoint: subscription.endpoint 
      }, 'success', `Successfully subscribed user ${userId} to push notifications`);
    } catch (error) {
      this.logToConsole('subscribeToPush Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to subscribe user ${userId} to push notifications`);
      throw error;
    }
  }

  async unsubscribeFromPush(endpoint: string, userId: string): Promise<void> {
    this.logToConsole('unsubscribeFromPush Started', { 
      endpoint,
      userId 
    }, 'info', `Unsubscribing user ${userId} from push notifications`);
    
    try {
      // In real implementation: POST /notifications/push/unsubscribe
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.logToConsole('unsubscribeFromPush Success', { 
        userId,
        endpoint 
      }, 'success', `Successfully unsubscribed user ${userId} from push notifications`);
    } catch (error) {
      this.logToConsole('unsubscribeFromPush Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to unsubscribe user ${userId} from push notifications`);
      throw error;
    }
  }

  async updateSettings(userId: string, settings: NotificationSettings): Promise<void> {
    this.logToConsole('updateSettings Started', { 
      userId,
      settingsKeys: Object.keys(settings)
    }, 'info', `Updating notification settings for user ${userId}`);
    
    try {
      // In real implementation: PUT /notifications/settings
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.logToConsole('updateSettings Success', { 
        userId 
      }, 'success', `Successfully updated notification settings for user ${userId}`);
    } catch (error) {
      this.logToConsole('updateSettings Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to update notification settings for user ${userId}`);
      throw error;
    }
  }

  async getSettings(userId: string): Promise<NotificationSettings> {
    this.logToConsole('getSettings Started', { userId }, 'info', `Retrieving notification settings for user ${userId}`);
    
    try {
      // In real implementation: GET /notifications/settings
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock settings
      const settings: NotificationSettings = {
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
        waterReminderConfig: null
      };

      this.logToConsole('getSettings Success', { 
        userId 
      }, 'success', `Retrieved notification settings for user ${userId}`);
      
      return settings;
    } catch (error) {
      this.logToConsole('getSettings Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve notification settings for user ${userId}`);
      throw error;
    }
  }
}

export const mockNotificationApi = new MockNotificationApi();