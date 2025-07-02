import { axiosClient } from '../axiosInstance';
import { NotificationSettings } from './types';
import { USE_MOCK_API, API_ENDPOINTS, formatEndpoint } from '../config';
import { mockNotificationApi } from '../mock/mockNotificationApi';

class NotificationApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('NOTIFICATION_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async subscribeToPush(subscription: PushSubscription, userId: string): Promise<void> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockNotificationApi.subscribeToPush(subscription, userId);
    }

    this.logToConsole('subscribeToPush Started', { 
      endpoint: subscription.endpoint,
      userId 
    }, 'info', `Subscribing user ${userId} to push notifications`);
    
    try {
      await axiosClient.post(API_ENDPOINTS.NOTIFICATION.SUBSCRIBE_PUSH, {
        subscription,
        userId
      });
      
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
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockNotificationApi.unsubscribeFromPush(endpoint, userId);
    }

    this.logToConsole('unsubscribeFromPush Started', { 
      endpoint,
      userId 
    }, 'info', `Unsubscribing user ${userId} from push notifications`);
    
    try {
      await axiosClient.post(API_ENDPOINTS.NOTIFICATION.UNSUBSCRIBE_PUSH, {
        endpoint,
        userId
      });
      
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
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockNotificationApi.updateSettings(userId, settings);
    }

    this.logToConsole('updateSettings Started', { 
      userId,
      settingsKeys: Object.keys(settings)
    }, 'info', `Updating notification settings for user ${userId}`);
    
    try {
      await axiosClient.put(API_ENDPOINTS.NOTIFICATION.UPDATE_SETTINGS, {
        userId,
        settings
      });
      
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
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockNotificationApi.getSettings(userId);
    }

    this.logToConsole('getSettings Started', { userId }, 'info', `Retrieving notification settings for user ${userId}`);
    
    try {
      const response = await axiosClient.get(`${API_ENDPOINTS.NOTIFICATION.GET_SETTINGS}?userId=${userId}`);
      
      this.logToConsole('getSettings Success', { 
        userId 
      }, 'success', `Retrieved notification settings for user ${userId}`);
      
      return response.data;
    } catch (error) {
      this.logToConsole('getSettings Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to retrieve notification settings for user ${userId}`);
      throw error;
    }
  }
}

export const notificationApi = new NotificationApi();