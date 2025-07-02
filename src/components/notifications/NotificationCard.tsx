import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, MessageCircle, Send } from 'lucide-react';
import { AppNotification, NotificationAction } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface NotificationCardProps {
  notification: AppNotification;
  onClick: () => void;
  onDismiss: () => void;
  onAction: (notificationId: string, actionId: string, value?: string) => void;
}

export function NotificationCard({ 
  notification, 
  onClick, 
  onDismiss, 
  onAction 
}: NotificationCardProps) {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const getNotificationIcon = () => {
    if (notification.icon) {
      return <span className="text-lg">{notification.icon}</span>;
    }

    switch (notification.type) {
      case 'medicine_reminder':
        return <span className="text-lg">💊</span>;
      case 'appointment_confirmed':
        return <span className="text-lg">👨‍⚕️</span>;
      case 'order_update':
        return <span className="text-lg">📦</span>;
      case 'interactive_message':
        return <MessageCircle className="w-5 h-5 text-primary-400" />;
      case 'system_alert':
        return <span className="text-lg">ℹ️</span>;
      default:
        return <span className="text-lg">🔔</span>;
    }
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-red-500/30 bg-red-500/5';
      case 'high':
        return 'border-orange-500/30 bg-orange-500/5';
      case 'normal':
        return 'border-dark-600/50 bg-dark-800/30';
      case 'low':
        return 'border-dark-700/50 bg-dark-800/20';
      default:
        return 'border-dark-600/50 bg-dark-800/30';
    }
  };

  const getTimeAgo = () => {
    const now = new Date();
    const notificationTime = new Date(notification.timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const handleActionClick = (action: NotificationAction) => {
    if (action.type === 'input') {
      setShowInput(true);
    } else {
      onAction(notification.id, action.id);
    }
  };

  const handleInputSubmit = (action: NotificationAction) => {
    if (inputValue.trim()) {
      onAction(notification.id, action.id, inputValue.trim());
      setInputValue('');
      setShowInput(false);
    }
  };

  const isUnread = notification.status === 'delivered' || notification.status === 'pending';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-4 rounded-xl border backdrop-blur-sm cursor-pointer
        transition-all duration-200 hover:shadow-soft-lg
        ${getPriorityStyles()}
        ${isUnread ? 'ring-1 ring-primary-500/20' : ''}
      `}
      onClick={onClick}
    >
      {/* Unread Indicator */}
      {isUnread && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
      )}

      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-6 p-1 text-dark-500 hover:text-white transition-colors rounded"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="flex items-start space-x-3 mb-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon()}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">
            {notification.title}
          </h4>
          <p className="text-dark-300 text-sm line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center text-xs text-dark-500 mb-3">
        <Clock className="w-3 h-3 mr-1" />
        {getTimeAgo()}
      </div>

      {/* Actions */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {/* Button Actions */}
          <div className="flex flex-wrap gap-2">
            {notification.actions
              .filter(action => action.type === 'button')
              .map((action) => (
                <Button
                  key={action.id}
                  variant={action.style === 'primary' ? 'primary' : 
                          action.style === 'success' ? 'success' :
                          action.style === 'warning' ? 'warning' :
                          action.style === 'danger' ? 'destructive' : 'outline'}
                  size="xs"
                  onClick={() => handleActionClick(action)}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
          </div>

          {/* Input Actions */}
          {notification.actions
            .filter(action => action.type === 'input')
            .map((action) => (
              <div key={action.id}>
                {!showInput ? (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleActionClick(action)}
                    leftIcon={<MessageCircle size={14} />}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex space-x-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={action.placeholder || 'Type your response...'}
                      size="sm"
                      className="flex-1 text-xs"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleInputSubmit(action);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleInputSubmit(action)}
                      disabled={!inputValue.trim()}
                      aria-label="Send response"
                    >
                      <Send size={14} />
                    </Button>
                  </motion.div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Priority Indicator */}
      {notification.priority === 'urgent' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />
      )}
      {notification.priority === 'high' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl" />
      )}
    </motion.div>
  );
}