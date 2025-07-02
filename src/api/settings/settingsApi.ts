import { axiosClient } from '../axiosInstance';
import { USE_MOCK_API, API_ENDPOINTS, formatEndpoint } from '../config';
import { mockSettingsApi } from '../mock/mockSettingsApi';

class SettingsApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('SETTINGS_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async updateProfile(userId: string, profileData: any): Promise<void> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockSettingsApi.updateProfile(userId, profileData);
    }

    this.logToConsole('updateProfile Started', { 
      userId,
      profileKeys: Object.keys(profileData)
    }, 'info', `Updating profile for user ${userId}`);
    
    try {
      await axiosClient.put(formatEndpoint(API_ENDPOINTS.SETTINGS.UPDATE_PROFILE, { userId }), profileData);
      
      this.logToConsole('updateProfile Success', { 
        userId 
      }, 'success', `Successfully updated profile for user ${userId}`);
    } catch (error) {
      this.logToConsole('updateProfile Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to update profile for user ${userId}`);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockSettingsApi.changePassword(userId, currentPassword, newPassword);
    }

    this.logToConsole('changePassword Started', { 
      userId,
      currentPasswordLength: currentPassword.length,
      newPasswordLength: newPassword.length
    }, 'info', `Changing password for user ${userId}`);
    
    try {
      await axiosClient.post(formatEndpoint(API_ENDPOINTS.SETTINGS.CHANGE_PASSWORD, { userId }), {
        currentPassword,
        newPassword
      });
      
      this.logToConsole('changePassword Success', { 
        userId 
      }, 'success', `Successfully changed password for user ${userId}`);
    } catch (error) {
      this.logToConsole('changePassword Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to change password for user ${userId}`);
      throw error;
    }
  }

  async exportUserData(userId: string): Promise<void> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockSettingsApi.exportUserData(userId);
    }

    this.logToConsole('exportUserData Started', { userId }, 'info', `Exporting data for user ${userId}`);
    
    try {
      await axiosClient.post(formatEndpoint(API_ENDPOINTS.SETTINGS.EXPORT_DATA, { userId }));
      
      this.logToConsole('exportUserData Success', { 
        userId 
      }, 'success', `Data export request submitted for user ${userId}`);
    } catch (error) {
      this.logToConsole('exportUserData Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to export data for user ${userId}`);
      throw error;
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    // Use mock API if configured
    if (USE_MOCK_API) {
      return mockSettingsApi.deleteAccount(userId);
    }

    this.logToConsole('deleteAccount Started', { userId }, 'info', `Deleting account for user ${userId}`);
    
    try {
      await axiosClient.delete(formatEndpoint(API_ENDPOINTS.SETTINGS.DELETE_ACCOUNT, { userId }));
      
      this.logToConsole('deleteAccount Success', { 
        userId 
      }, 'success', `Successfully deleted account for user ${userId}`);
    } catch (error) {
      this.logToConsole('deleteAccount Failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'error', `Failed to delete account for user ${userId}`);
      throw error;
    }
  }
}

export const settingsApi = new SettingsApi();