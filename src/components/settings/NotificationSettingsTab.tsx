import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Pill, 
  Calendar, 
  Droplets, 
  Heart,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Dropdown } from '../ui/Dropdown';
import { Alert } from '../ui/Alert';
import { 
  NotificationSettings, 
  MedicineReminderConfig, 
  AppointmentReminderConfig, 
  PharmacyReminderConfig, 
  WaterReminderConfig 
} from '../../types';
import { notificationService } from '../../services/NotificationService';

interface NotificationSettingsTabProps {
  className?: string;
}

export function NotificationSettingsTab({ className = '' }: NotificationSettingsTabProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPharmacyForm, setShowPharmacyForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineReminderConfig | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentReminderConfig | null>(null);
  const [editingPharmacy, setEditingPharmacy] = useState<PharmacyReminderConfig | null>(null);

  // Form data
  const [medicineForm, setMedicineForm] = useState({
    medicineName: '',
    dosage: '',
    frequency: 1,
    times: ['09:00']
  });

  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: '',
    appointmentType: 'offline' as 'online' | 'offline',
    appointmentDate: '',
    appointmentTime: '',
    reminderMinutes: 30,
    allowReschedule: true
  });

  const [pharmacyForm, setPharmacyForm] = useState({
    medicineName: '',
    purchaseDate: '',
    expiryDate: '',
    reminderDaysBefore: 2
  });

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('NOTIFICATION_SETTINGS', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToSettings((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    if (!settings) return;
    
    const newSettings = { ...settings, ...updates };
    notificationService.updateSettings(newSettings);
    setMessage({ type: 'success', text: 'Settings updated successfully!' });
    
    logToConsole('Settings Updated', {
      updatedFields: Object.keys(updates)
    }, 'success');
  };

  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Medicine Reminder Functions
  const addMedicineReminder = () => {
    if (!settings || !medicineForm.medicineName.trim() || !medicineForm.dosage.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const newReminder: MedicineReminderConfig = {
      id: generateId(),
      medicineName: medicineForm.medicineName.trim(),
      dosage: medicineForm.dosage.trim(),
      frequency: medicineForm.frequency,
      times: medicineForm.times,
      enabled: true,
      createdAt: new Date()
    };

    const updatedReminders = [...(settings.medicineRemindersConfig || []), newReminder];
    updateSettings({ medicineRemindersConfig: updatedReminders });

    // Schedule the reminder
    notificationService.scheduleMedicineReminder(newReminder);

    setMedicineForm({ medicineName: '', dosage: '', frequency: 1, times: ['09:00'] });
    setShowMedicineForm(false);

    logToConsole('Medicine Reminder Added', {
      medicineName: newReminder.medicineName,
      frequency: newReminder.frequency,
      times: newReminder.times
    }, 'success');
  };

  const updateMedicineReminder = () => {
    if (!settings || !editingMedicine || !medicineForm.medicineName.trim() || !medicineForm.dosage.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const updatedReminder: MedicineReminderConfig = {
      ...editingMedicine,
      medicineName: medicineForm.medicineName.trim(),
      dosage: medicineForm.dosage.trim(),
      frequency: medicineForm.frequency,
      times: medicineForm.times
    };

    const updatedReminders = settings.medicineRemindersConfig?.map(reminder =>
      reminder.id === editingMedicine.id ? updatedReminder : reminder
    ) || [];

    updateSettings({ medicineRemindersConfig: updatedReminders });

    setEditingMedicine(null);
    setMedicineForm({ medicineName: '', dosage: '', frequency: 1, times: ['09:00'] });

    logToConsole('Medicine Reminder Updated', {
      id: updatedReminder.id,
      medicineName: updatedReminder.medicineName
    }, 'success');
  };

  const deleteMedicineReminder = (id: string) => {
    if (!settings) return;

    const updatedReminders = settings.medicineRemindersConfig?.filter(reminder => reminder.id !== id) || [];
    updateSettings({ medicineRemindersConfig: updatedReminders });

    logToConsole('Medicine Reminder Deleted', { id }, 'info');
  };

  const toggleMedicineReminder = (id: string, enabled: boolean) => {
    if (!settings) return;

    const updatedReminders = settings.medicineRemindersConfig?.map(reminder =>
      reminder.id === id ? { ...reminder, enabled } : reminder
    ) || [];

    updateSettings({ medicineRemindersConfig: updatedReminders });

    logToConsole('Medicine Reminder Toggled', { id, enabled }, 'info');
  };

  // Appointment Reminder Functions
  const addAppointmentReminder = () => {
    if (!settings || !appointmentForm.doctorName.trim() || !appointmentForm.appointmentDate || !appointmentForm.appointmentTime) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const appointmentDateTime = new Date(`${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}`);

    const newReminder: AppointmentReminderConfig = {
      id: generateId(),
      doctorName: appointmentForm.doctorName.trim(),
      appointmentType: appointmentForm.appointmentType,
      appointmentDate: appointmentDateTime,
      appointmentTime: appointmentForm.appointmentTime,
      reminderMinutes: appointmentForm.reminderMinutes,
      allowReschedule: appointmentForm.allowReschedule,
      enabled: true,
      createdAt: new Date()
    };

    const updatedReminders = [...(settings.appointmentRemindersConfig || []), newReminder];
    updateSettings({ appointmentRemindersConfig: updatedReminders });

    // Schedule the reminder
    notificationService.scheduleAppointmentReminder(newReminder);

    setAppointmentForm({
      doctorName: '',
      appointmentType: 'offline',
      appointmentDate: '',
      appointmentTime: '',
      reminderMinutes: 30,
      allowReschedule: true
    });
    setShowAppointmentForm(false);

    logToConsole('Appointment Reminder Added', {
      doctorName: newReminder.doctorName,
      appointmentDate: appointmentDateTime.toISOString(),
      type: newReminder.appointmentType
    }, 'success');
  };

  // Pharmacy Reminder Functions
  const addPharmacyReminder = () => {
    if (!settings || !pharmacyForm.medicineName.trim() || !pharmacyForm.purchaseDate || !pharmacyForm.expiryDate) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    const newReminder: PharmacyReminderConfig = {
      id: generateId(),
      medicineName: pharmacyForm.medicineName.trim(),
      purchaseDate: new Date(pharmacyForm.purchaseDate),
      expiryDate: new Date(pharmacyForm.expiryDate),
      reminderDaysBefore: pharmacyForm.reminderDaysBefore,
      enabled: true,
      createdAt: new Date()
    };

    const updatedReminders = [...(settings.pharmacyRemindersConfig || []), newReminder];
    updateSettings({ pharmacyRemindersConfig: updatedReminders });

    // Schedule the reminder
    notificationService.schedulePharmacyReminder(newReminder);

    setPharmacyForm({
      medicineName: '',
      purchaseDate: '',
      expiryDate: '',
      reminderDaysBefore: 2
    });
    setShowPharmacyForm(false);

    logToConsole('Pharmacy Reminder Added', {
      medicineName: newReminder.medicineName,
      expiryDate: newReminder.expiryDate.toISOString(),
      reminderDaysBefore: newReminder.reminderDaysBefore
    }, 'success');
  };

  // Water Reminder Functions
  const updateWaterReminder = (updates: Partial<WaterReminderConfig>) => {
    if (!settings) return;

    const currentConfig = settings.waterReminderConfig || {
      id: generateId(),
      dailyGoal: 3,
      reminderInterval: 120,
      startTime: '08:00',
      endTime: '22:00',
      enabled: false,
      currentIntake: 0,
      lastResetDate: new Date(),
      createdAt: new Date()
    };

    const updatedConfig = { ...currentConfig, ...updates };
    updateSettings({ waterReminderConfig: updatedConfig });

    if (updatedConfig.enabled) {
      notificationService.scheduleWaterReminder(updatedConfig);
    }

    logToConsole('Water Reminder Updated', {
      dailyGoal: updatedConfig.dailyGoal,
      enabled: updatedConfig.enabled,
      reminderInterval: updatedConfig.reminderInterval
    }, 'success');
  };

  const addWaterIntake = (amount: number) => {
    if (!settings?.waterReminderConfig) return;

    const config = settings.waterReminderConfig;
    const today = new Date().toDateString();
    const lastReset = new Date(config.lastResetDate).toDateString();

    // Reset if it's a new day
    const currentIntake = today !== lastReset ? 0 : config.currentIntake;
    const newIntake = Math.min(currentIntake + amount, config.dailyGoal);

    updateWaterReminder({
      currentIntake: newIntake,
      lastResetDate: new Date()
    });

    if (newIntake >= config.dailyGoal) {
      notificationService.addSystemAlert(
        'Daily Water Goal Achieved! 🎉',
        `Congratulations! You've reached your daily water goal of ${config.dailyGoal}L.`,
        'normal'
      );
    }

    logToConsole('Water Intake Added', {
      amount,
      newIntake,
      goalReached: newIntake >= config.dailyGoal
    }, 'info');
  };

  // Time management for medicine reminders
  const updateMedicineTimes = (frequency: number) => {
    const defaultTimes = {
      1: ['09:00'],
      2: ['09:00', '21:00'],
      3: ['08:00', '14:00', '20:00'],
      4: ['08:00', '12:00', '16:00', '20:00']
    };

    const times = defaultTimes[frequency as keyof typeof defaultTimes] || ['09:00'];
    setMedicineForm(prev => ({ ...prev, frequency, times }));
  };

  const updateTimeAtIndex = (index: number, time: string) => {
    setMedicineForm(prev => ({
      ...prev,
      times: prev.times.map((t, i) => i === index ? time : t)
    }));
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
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

      {/* Medicine Reminders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Pill className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Medicine Reminders</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMedicineForm(true)}
            leftIcon={<Plus />}
          >
            Add Medicine
          </Button>
        </div>

        {/* Medicine List */}
        <div className="space-y-3 mb-4">
          {settings.medicineRemindersConfig?.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
              <div className="flex-1">
                <h4 className="text-white font-medium">{reminder.medicineName}</h4>
                <p className="text-dark-400 text-sm">
                  {reminder.dosage} • {reminder.frequency}x daily at {reminder.times.join(', ')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Toggle
                  checked={reminder.enabled}
                  onChange={(enabled) => toggleMedicineReminder(reminder.id, enabled)}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setEditingMedicine(reminder);
                    setMedicineForm({
                      medicineName: reminder.medicineName,
                      dosage: reminder.dosage,
                      frequency: reminder.frequency,
                      times: reminder.times
                    });
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => deleteMedicineReminder(reminder.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Medicine Form */}
        <AnimatePresence>
          {(showMedicineForm || editingMedicine) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-dark-700 pt-4"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Medicine Name"
                    value={medicineForm.medicineName}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, medicineName: e.target.value }))}
                    placeholder="e.g., Metformin"
                  />
                  <Input
                    label="Dosage"
                    value={medicineForm.dosage}
                    onChange={(e) => setMedicineForm(prev => ({ ...prev, dosage: e.target.value }))}
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    How many times a day?
                  </label>
                  <Dropdown
                    options={[
                      { value: '1', label: 'Once daily' },
                      { value: '2', label: 'Twice daily' },
                      { value: '3', label: 'Three times daily' },
                      { value: '4', label: 'Four times daily' }
                    ]}
                    value={medicineForm.frequency.toString()}
                    onSelect={(value) => updateMedicineTimes(parseInt(value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Reminder Times
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {medicineForm.times.map((time, index) => (
                      <Input
                        key={index}
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeAtIndex(index, e.target.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={editingMedicine ? updateMedicineReminder : addMedicineReminder}
                    variant="primary"
                    size="sm"
                    leftIcon={<Save />}
                  >
                    {editingMedicine ? 'Update' : 'Add'} Medicine
                  </Button>
                  <Button
                    onClick={() => {
                      setShowMedicineForm(false);
                      setEditingMedicine(null);
                      setMedicineForm({ medicineName: '', dosage: '', frequency: 1, times: ['09:00'] });
                    }}
                    variant="outline"
                    size="sm"
                    leftIcon={<X />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Appointment Reminders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-secondary-400" />
            <h3 className="text-lg font-semibold text-white">Appointment Reminders</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAppointmentForm(true)}
            leftIcon={<Plus />}
          >
            Add Appointment
          </Button>
        </div>

        {/* Appointment List */}
        <div className="space-y-3 mb-4">
          {settings.appointmentRemindersConfig?.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
              <div className="flex-1">
                <h4 className="text-white font-medium">Dr. {reminder.doctorName}</h4>
                <p className="text-dark-400 text-sm">
                  {reminder.appointmentDate.toLocaleDateString()} at {reminder.appointmentTime} • {reminder.appointmentType}
                  {reminder.allowReschedule && ' • Reschedule available'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Toggle
                  checked={reminder.enabled}
                  onChange={(enabled) => {
                    const updatedReminders = settings.appointmentRemindersConfig?.map(r =>
                      r.id === reminder.id ? { ...r, enabled } : r
                    ) || [];
                    updateSettings({ appointmentRemindersConfig: updatedReminders });
                  }}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    const updatedReminders = settings.appointmentRemindersConfig?.filter(r => r.id !== reminder.id) || [];
                    updateSettings({ appointmentRemindersConfig: updatedReminders });
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Appointment Form */}
        <AnimatePresence>
          {showAppointmentForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-dark-700 pt-4"
            >
              <div className="space-y-4">
                <Input
                  label="Doctor Name"
                  value={appointmentForm.doctorName}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, doctorName: e.target.value }))}
                  placeholder="e.g., Sarah Johnson"
                />

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Appointment Type
                  </label>
                  <Dropdown
                    options={[
                      { value: 'offline', label: 'In-person visit' },
                      { value: 'online', label: 'Online consultation' }
                    ]}
                    value={appointmentForm.appointmentType}
                    onSelect={(value) => setAppointmentForm(prev => ({ ...prev, appointmentType: value as 'online' | 'offline' }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    value={appointmentForm.appointmentDate}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={appointmentForm.appointmentTime}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Remind me before
                  </label>
                  <Dropdown
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '60', label: '1 hour' },
                      { value: '1440', label: '1 day' }
                    ]}
                    value={appointmentForm.reminderMinutes.toString()}
                    onSelect={(value) => setAppointmentForm(prev => ({ ...prev, reminderMinutes: parseInt(value) }))}
                  />
                </div>

                <Toggle
                  checked={appointmentForm.allowReschedule}
                  onChange={(checked) => setAppointmentForm(prev => ({ ...prev, allowReschedule: checked }))}
                  label="Allow reschedule option"
                  description="Show reschedule button in reminder notifications"
                />

                <div className="flex space-x-3">
                  <Button
                    onClick={addAppointmentReminder}
                    variant="primary"
                    size="sm"
                    leftIcon={<Save />}
                  >
                    Add Appointment
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAppointmentForm(false);
                      setAppointmentForm({
                        doctorName: '',
                        appointmentType: 'offline',
                        appointmentDate: '',
                        appointmentTime: '',
                        reminderMinutes: 30,
                        allowReschedule: true
                      });
                    }}
                    variant="outline"
                    size="sm"
                    leftIcon={<X />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Pharmacy Notifications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Pill className="w-5 h-5 text-accent-400" />
            <h3 className="text-lg font-semibold text-white">Pharmacy Notifications</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPharmacyForm(true)}
            leftIcon={<Plus />}
          >
            Add Medicine
          </Button>
        </div>

        {/* Pharmacy List */}
        <div className="space-y-3 mb-4">
          {settings.pharmacyRemindersConfig?.map((reminder) => {
            const daysUntilExpiry = Math.ceil((reminder.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isExpiringSoon = daysUntilExpiry <= reminder.reminderDaysBefore;
            
            return (
              <div key={reminder.id} className={`flex items-center justify-between p-3 rounded-lg ${
                isExpiringSoon ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-dark-800/50'
              }`}>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{reminder.medicineName}</h4>
                  <p className={`text-sm ${isExpiringSoon ? 'text-yellow-400' : 'text-dark-400'}`}>
                    Expires {reminder.expiryDate.toLocaleDateString()} 
                    {isExpiringSoon && ` (${daysUntilExpiry} days left)`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Toggle
                    checked={reminder.enabled}
                    onChange={(enabled) => {
                      const updatedReminders = settings.pharmacyRemindersConfig?.map(r =>
                        r.id === reminder.id ? { ...r, enabled } : r
                      ) || [];
                      updateSettings({ pharmacyRemindersConfig: updatedReminders });
                    }}
                    size="sm"
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      const updatedReminders = settings.pharmacyRemindersConfig?.filter(r => r.id !== reminder.id) || [];
                      updateSettings({ pharmacyRemindersConfig: updatedReminders });
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pharmacy Form */}
        <AnimatePresence>
          {showPharmacyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-dark-700 pt-4"
            >
              <div className="space-y-4">
                <Input
                  label="Medicine Name"
                  value={pharmacyForm.medicineName}
                  onChange={(e) => setPharmacyForm(prev => ({ ...prev, medicineName: e.target.value }))}
                  placeholder="e.g., Aspirin"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Purchase Date"
                    type="date"
                    value={pharmacyForm.purchaseDate}
                    onChange={(e) => setPharmacyForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  />
                  <Input
                    label="Expiry Date"
                    type="date"
                    value={pharmacyForm.expiryDate}
                    onChange={(e) => setPharmacyForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Remind me before expiry
                  </label>
                  <Dropdown
                    options={[
                      { value: '1', label: '1 day before' },
                      { value: '2', label: '2 days before' },
                      { value: '3', label: '3 days before' },
                      { value: '7', label: '1 week before' }
                    ]}
                    value={pharmacyForm.reminderDaysBefore.toString()}
                    onSelect={(value) => setPharmacyForm(prev => ({ ...prev, reminderDaysBefore: parseInt(value) }))}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={addPharmacyReminder}
                    variant="primary"
                    size="sm"
                    leftIcon={<Save />}
                  >
                    Add Medicine
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPharmacyForm(false);
                      setPharmacyForm({
                        medicineName: '',
                        purchaseDate: '',
                        expiryDate: '',
                        reminderDaysBefore: 2
                      });
                    }}
                    variant="outline"
                    size="sm"
                    leftIcon={<X />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Health Check-up */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Heart className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Health Check-up Reminders</h3>
        </div>

        <div className="space-y-4">
          <Toggle
            checked={settings.healthCheckupEnabled || false}
            onChange={(enabled) => updateSettings({ healthCheckupEnabled: enabled })}
            label="Enable health check-up reminders"
            description="Get personalized health tips and check-in questions based on your profile"
          />

          {settings.healthCheckupEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-6 border-l-2 border-primary-500/30"
            >
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Check-up frequency
                </label>
                <Dropdown
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ]}
                  value={settings.healthCheckupFrequency || 'weekly'}
                  onSelect={(value) => updateSettings({ healthCheckupFrequency: value as 'daily' | 'weekly' | 'monthly' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Preferred time
                </label>
                <Input
                  type="time"
                  value={settings.healthCheckupTime || '14:00'}
                  onChange={(e) => updateSettings({ healthCheckupTime: e.target.value })}
                />
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Daily Water Reminder */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Droplets className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Daily Water Reminder</h3>
        </div>

        <div className="space-y-4">
          <Toggle
            checked={settings.waterReminderConfig?.enabled || false}
            onChange={(enabled) => updateWaterReminder({ enabled })}
            label="Enable water intake reminders"
            description="Stay hydrated with regular water intake reminders"
          />

          {settings.waterReminderConfig?.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pl-6 border-l-2 border-blue-500/30"
            >
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Daily water goal
                </label>
                <Dropdown
                  options={[
                    { value: '2', label: '2 liters' },
                    { value: '3', label: '3 liters' },
                    { value: '4', label: '4 liters' },
                    { value: '5', label: '5 liters' }
                  ]}
                  value={settings.waterReminderConfig?.dailyGoal?.toString() || '3'}
                  onSelect={(value) => updateWaterReminder({ dailyGoal: parseInt(value) })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start time"
                  type="time"
                  value={settings.waterReminderConfig?.startTime || '08:00'}
                  onChange={(e) => updateWaterReminder({ startTime: e.target.value })}
                />
                <Input
                  label="End time"
                  type="time"
                  value={settings.waterReminderConfig?.endTime || '22:00'}
                  onChange={(e) => updateWaterReminder({ endTime: e.target.value })}
                />
              </div>

              {/* Water Intake Tracker */}
              <div className="bg-dark-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">Today's Progress</h4>
                  <span className="text-blue-400 font-semibold">
                    {settings.waterReminderConfig?.currentIntake || 0}L / {settings.waterReminderConfig?.dailyGoal || 3}L
                  </span>
                </div>

                <div className="w-full bg-dark-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((settings.waterReminderConfig?.currentIntake || 0) / (settings.waterReminderConfig?.dailyGoal || 3)) * 100, 100)}%` 
                    }}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => addWaterIntake(0.5)}
                    className="flex-1"
                  >
                    +0.5L
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => addWaterIntake(1)}
                    className="flex-1"
                  >
                    +1L
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      const remaining = (settings.waterReminderConfig?.dailyGoal || 3) - (settings.waterReminderConfig?.currentIntake || 0);
                      if (remaining > 0) {
                        addWaterIntake(remaining);
                      }
                    }}
                    className="flex-1"
                    disabled={(settings.waterReminderConfig?.currentIntake || 0) >= (settings.waterReminderConfig?.dailyGoal || 3)}
                  >
                    Complete Goal
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}