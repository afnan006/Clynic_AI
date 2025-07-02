class MockSettingsApi {
  private logToConsole(action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('SETTINGS_API', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level, normalDescription);
    }
  }

  async updateProfile(userId: string, profileData: any): Promise<void> {
    this.logToConsole('updateProfile Started', { 
      userId,
      profileKeys: Object.keys(profileData)
    }, 'info', `Updating profile for user ${userId}`);
    
    try {
      // In real implementation: PUT /users/{userId}/profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    this.logToConsole('changePassword Started', { 
      userId,
      currentPasswordLength: currentPassword.length,
      newPasswordLength: newPassword.length
    }, 'info', `Changing password for user ${userId}`);
    
    try {
      // In real implementation: POST /users/{userId}/change-password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    this.logToConsole('exportUserData Started', { userId }, 'info', `Exporting data for user ${userId}`);
    
    try {
      // In real implementation: POST /users/{userId}/export-data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
    this.logToConsole('deleteAccount Started', { userId }, 'info', `Deleting account for user ${userId}`);
    
    try {
      // In real implementation: DELETE /users/{userId}
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

export const mockSettingsApi = new MockSettingsApi();