import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Settings } from 'lucide-react';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/NotificationService';
import { NotificationCard } from './NotificationCard';
import { Button } from '../ui/Button';
import { useResponsive } from '../../hooks/useResponsive';

interface NotificationDisplayProps {
  className?: string;
}

export function NotificationDisplay({ className = '' }: NotificationDisplayProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isMobile } = useResponsive();

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      
      // Calculate unread count
      const unread = newNotifications.filter(n => 
        n.status === 'delivered' || n.status === 'pending'
      ).length;
      setUnreadCount(unread);
    });

    return unsubscribe;
  }, []);

  const handleNotificationClick = (notification: AppNotification) => {
    notificationService.markAsRead(notification.id);
    
    // Handle click action
    if (notification.clickAction) {
      if (notification.clickAction.type === 'navigate') {
        window.location.href = notification.clickAction.target;
      } else if (notification.clickAction.type === 'external') {
        window.open(notification.clickAction.target, '_blank');
      }
    }
  };

  const handleNotificationDismiss = (notificationId: string) => {
    notificationService.dismissNotification(notificationId);
  };

  const handleNotificationAction = (notificationId: string, actionId: string, value?: string) => {
    notificationService.handleAction(notificationId, actionId, value);
  };

  const clearAllNotifications = () => {
    notifications.forEach(notification => {
      notificationService.dismissNotification(notification.id);
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-800/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Notification Panel */}
            <motion.div
              initial={isMobile ? { x: '100%' } : { opacity: 0, y: -10, scale: 0.95 }}
              animate={isMobile ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
              exit={isMobile ? { x: '100%' } : { opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`
                ${isMobile 
                  ? 'fixed top-0 right-0 h-full w-80 z-50' 
                  : 'absolute top-12 right-0 w-96 max-h-[80vh] z-50'
                }
                bg-dark-800/95 backdrop-blur-xl border border-dark-700 shadow-soft-xl
                ${isMobile ? 'rounded-l-2xl' : 'rounded-2xl'}
                flex flex-col overflow-hidden
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary-400" />
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-primary-400 bg-primary-500/20 px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {/* Open notification settings */}}
                    aria-label="Notification settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close notifications"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <Bell className="w-12 h-12 text-dark-600 mb-4" />
                    <h4 className="text-white font-medium mb-2">No notifications</h4>
                    <p className="text-dark-400 text-sm">
                      You're all caught up! New notifications will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    <AnimatePresence>
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <NotificationCard
                            notification={notification}
                            onClick={() => handleNotificationClick(notification)}
                            onDismiss={() => handleNotificationDismiss(notification.id)}
                            onAction={handleNotificationAction}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t border-dark-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="w-full text-dark-400 hover:text-white"
                  >
                    Clear All Notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}