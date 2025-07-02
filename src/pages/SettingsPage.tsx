import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Palette, 
  Info, 
  Settings as SettingsIcon,
  Edit3,
  Lock,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Bell,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useResponsive } from '../hooks/useResponsive';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { NotificationSettingsTab } from '../components/settings/NotificationSettingsTab';
import { PaymentHistoryTab } from '../components/settings/PaymentHistoryTab';

interface SettingsPageProps {
  onClose: () => void;
}

type SettingsSection = 'account' | 'privacy' | 'notifications' | 'payments' | 'appearance' | 'about';

export function SettingsPage({ onClose }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { authState, signOut, updateUser, reinitializeEncryption } = useAuth();
  const { isMobile } = useResponsive();

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('SETTINGS', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  React.useEffect(() => {
    if (authState.user) {
      setProfileData(prev => ({
        ...prev,
        name: authState.user?.name || '',
        phone: authState.user?.phone || ''
      }));
    }
  }, [authState.user]);

  const navigationItems = [
    { id: 'account' as SettingsSection, label: 'Account & Profile', icon: User },
    { id: 'privacy' as SettingsSection, label: 'Privacy & Security', icon: Shield },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
    { id: 'payments' as SettingsSection, label: 'Payments', icon: CreditCard },
    { id: 'appearance' as SettingsSection, label: 'Appearance', icon: Palette },
    { id: 'about' as SettingsSection, label: 'About & Support', icon: Info },
  ];

  const handleProfileSave = async () => {
    if (!authState.user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Validate inputs
      if (profileData.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      if (profileData.phone && profileData.phone.length < 10) {
        throw new Error('Please enter a valid phone number');
      }

      // Update user profile
      const updatedUser = {
        ...authState.user,
        name: profileData.name.trim(),
        phone: profileData.phone || authState.user.phone
      };

      updateUser(updatedUser);
      setIsEditingProfile(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      logToConsole('Profile Updated', {
        userId: authState.user.id,
        hasName: !!profileData.name,
        hasPhone: !!profileData.phone
      }, 'success');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
      
      logToConsole('Profile Update Failed', {
        error: errorMessage,
        userId: authState.user?.id
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate passwords
      if (!profileData.currentPassword) {
        throw new Error('Current password is required');
      }

      if (profileData.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      if (profileData.newPassword !== profileData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      // Mock password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      logToConsole('Password Changed', {
        userId: authState.user?.id
      }, 'success');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setMessage({ type: 'error', text: errorMessage });
      
      logToConsole('Password Change Failed', {
        error: errorMessage,
        userId: authState.user?.id
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Mock data export API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ 
        type: 'success', 
        text: 'Data export request submitted. You will receive an encrypted archive at your registered email address within 24 hours.' 
      });

      logToConsole('Data Export Requested', {
        userId: authState.user?.id,
        requestTime: new Date().toISOString()
      }, 'success');

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to request data export. Please try again.' });
      
      logToConsole('Data Export Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: authState.user?.id
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Mock account deletion API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      logToConsole('Account Deletion Requested', {
        userId: authState.user?.id,
        requestTime: new Date().toISOString()
      }, 'success');

      // Sign out user after deletion
      signOut();
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      
      logToConsole('Account Deletion Failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: authState.user?.id
      }, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAccountSection = () => (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            leftIcon={isEditingProfile ? <X /> : <Edit3 />}
          >
            {isEditingProfile ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
            <Input
              label="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
              type="tel"
            />
            <div className="flex space-x-3">
              <Button
                onClick={handleProfileSave}
                variant="primary"
                size="sm"
                isLoading={isLoading}
                leftIcon={<Check />}
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setIsEditingProfile(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-dark-400">Name</label>
              <p className="text-white">{authState.user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-dark-400">Email</label>
              <p className="text-white">{authState.user?.email || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-dark-400">Phone</label>
              <p className="text-white">{authState.user?.phone || 'Not set'}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type={showPasswords.current ? 'text' : 'password'}
            value={profileData.currentPassword}
            onChange={(e) => setProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
            placeholder="Enter current password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="text-dark-400 hover:text-white"
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Input
            label="New Password"
            type={showPasswords.new ? 'text' : 'password'}
            value={profileData.newPassword}
            onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
            placeholder="Enter new password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="text-dark-400 hover:text-white"
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Input
            label="Confirm New Password"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={profileData.confirmPassword}
            onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Confirm new password"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="text-dark-400 hover:text-white"
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Button
            onClick={handlePasswordChange}
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Lock />}
          >
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      {/* Encryption Status */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Data Encryption Status</h3>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            authState.isKeyDerived && !authState.isLoading
              ? 'bg-green-500/20 text-green-400'
              : authState.isLoading
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-red-500/20 text-red-400'
          }`}>
            {authState.isKeyDerived && !authState.isLoading ? (
              <Shield className="w-6 h-6" />
            ) : authState.isLoading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">
              {authState.isKeyDerived && !authState.isLoading
                ? 'Your Data is Securely Encrypted'
                : authState.isLoading
                  ? 'Encryption Initializing...'
                  : 'Encryption Failed'
              }
            </p>
            <p className="text-dark-400 text-sm">
              {authState.isKeyDerived && !authState.isLoading
                ? 'All your messages and data are protected with AES-256-GCM encryption'
                : authState.isLoading
                  ? 'Setting up your encryption keys...'
                  : 'Your encryption keys could not be initialized'
              }
            </p>
          </div>
          {!authState.isKeyDerived && !authState.isLoading && (
            <Button
              onClick={reinitializeEncryption}
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw />}
            >
              Retry Setup
            </Button>
          )}
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Export Your Data</p>
                <p className="text-dark-400 text-sm">Download an encrypted archive of all your data</p>
              </div>
            </div>
            <Button
              onClick={handleDataExport}
              variant="outline"
              size="sm"
              isLoading={isLoading}
            >
              Request Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Delete Account</p>
                <p className="text-red-400 text-sm">Permanently delete your account and all data</p>
              </div>
            </div>
            <Button
              onClick={handleAccountDeletion}
              variant="destructive"
              size="sm"
              isLoading={isLoading}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Theme Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-dark-400 text-sm">Currently using dark theme</p>
            </div>
            <div className="bg-primary-500 w-12 h-6 rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-dark-400 text-xs">Light mode will be available in a future update</p>
        </div>
      </Card>
    </div>
  );

  const renderAboutSection = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Application Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-dark-400">Version</label>
            <p className="text-white">1.0.0</p>
          </div>
          <div>
            <label className="text-sm text-dark-400">Build</label>
            <p className="text-white">2024.01.15</p>
          </div>
          <div>
            <label className="text-sm text-dark-400">Last Updated</label>
            <p className="text-white">January 15, 2024</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Support & Legal</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 hover:bg-dark-700/50 rounded-lg transition-colors">
            <p className="text-white">Help Center</p>
            <p className="text-dark-400 text-sm">Get help and support</p>
          </button>
          <button className="w-full text-left p-3 hover:bg-dark-700/50 rounded-lg transition-colors">
            <p className="text-white">Privacy Policy</p>
            <p className="text-dark-400 text-sm">How we protect your data</p>
          </button>
          <button className="w-full text-left p-3 hover:bg-dark-700/50 rounded-lg transition-colors">
            <p className="text-white">Terms of Service</p>
            <p className="text-dark-400 text-sm">Terms and conditions</p>
          </button>
        </div>
      </Card>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSection();
      case 'privacy':
        return renderPrivacySection();
      case 'notifications':
        return <NotificationSettingsTab />;
      case 'payments':
        return <PaymentHistoryTab />;
      case 'appearance':
        return renderAppearanceSection();
      case 'about':
        return renderAboutSection();
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-6xl h-[90vh] bg-dark-900 border border-dark-700 rounded-2xl shadow-soft-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<ArrowLeft />}
              className="mr-2"
            >
              {isMobile ? '' : 'Back'}
            </Button>
            <SettingsIcon className="w-6 h-6 text-primary-400" />
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <div className="text-sm text-dark-400">
            {authState.user?.name || authState.user?.email || 'Demo User'}
          </div>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          {/* Navigation Sidebar */}
          <div className={`${isMobile ? 'w-full' : 'w-64'} border-r border-dark-700 p-4 ${isMobile && activeSection !== 'account' ? 'hidden' : ''}`}>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className={`flex-1 overflow-y-auto scrollbar-hide p-6 ${isMobile && activeSection === 'account' ? 'hidden' : ''}`}>
            {/* Mobile Navigation */}
            {isMobile && (
              <div className="mb-6">
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeSection === item.id
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-800 text-dark-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <Alert
                    variant={message.type === 'success' ? 'success' : 'error'}
                    description={message.text}
                    dismissible
                    onDismiss={() => setMessage(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSectionContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}