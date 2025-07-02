import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, FileText, Image as ImageIcon } from 'lucide-react';
import { Message, AttachmentPreview } from '../../../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const hasAttachments = isUser && message.attachments && message.attachments.length > 0;

  // Log attachment details for debugging
  if (hasAttachments) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('CHAT_MESSAGE', 'Rendering Message with Attachments', {
        messageId: message.id,
        attachmentCount: message.attachments?.length,
        attachments: message.attachments?.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size,
          hasPreview: !!att.preview,
          previewUrlStart: att.preview ? att.preview.substring(0, 30) + '...' : 'none',
          previewType: att.preview ? (att.preview.startsWith('blob:') ? 'blob URL' : 'data URL') : 'none'
        }))
      }, 'info');
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-white/90" />;
    }
    return <FileText className="w-4 h-4 text-white/90" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* AI Message - Transparent, seamless with background */}
        {!isUser ? (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="relative px-2 py-2"
          >
            <div className="flex items-start space-x-2">
              {/* Stethoscope icon for AI messages */}
              <div className="flex-shrink-0 mt-1">
                <Stethoscope className="w-4 h-4 text-primary-400" />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">
                {message.message}
              </p>
            </div>
          </motion.div>
        ) : (
          /* User Message - Enhanced gradient bubble */
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="relative px-4 py-3 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 text-white ml-auto shadow-soft-lg"
          >
            {/* Attachment Previews inside the bubble */}
            {hasAttachments && (
              <div className="flex space-x-2 mb-3 justify-center">
                {message.attachments.map((attachment, index) => {
                  // Log each individual attachment as it's being rendered
                  if (typeof window !== 'undefined' && (window as any).devConsole) {
                    (window as any).devConsole.log('CHAT_MESSAGE', 'Rendering Attachment', {
                      attachmentIndex: index,
                      fileName: attachment.name,
                      fileType: attachment.type,
                      fileSize: attachment.size,
                      hasPreview: !!attachment.preview,
                      previewUrlLength: attachment.preview?.length || 0,
                      previewUrlStart: attachment.preview ? attachment.preview.substring(0, 30) + '...' : 'none'
                    }, 'info');
                  }
                  
                  return (
                    <div
                      key={`${attachment.name}-${index}`}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20 shadow-soft bg-white/10"
                    >
                      {/* Attachment Preview */}
                      <div className="w-full h-full flex items-center justify-center">
                        {attachment.type.startsWith('image/') && attachment.preview ? (
                          <img
                            src={attachment.preview}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Log image loading errors
                              if (typeof window !== 'undefined' && (window as any).devConsole) {
                                (window as any).devConsole.log('CHAT_MESSAGE', 'Image Preview Error', {
                                  fileName: attachment.name,
                                  fileType: attachment.type,
                                  previewUrlStart: attachment.preview ? attachment.preview.substring(0, 30) + '...' : 'none',
                                  error: 'Failed to load image preview'
                                }, 'error');
                              }
                              // Replace with file icon on error
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
                              const iconElement = document.createElement('div');
                              iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white/90"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
                              e.currentTarget.parentElement?.appendChild(iconElement);
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            {getFileIcon(attachment.type)}
                            <span className="text-xs text-white/90 mt-1 px-1 truncate max-w-full">
                              {attachment.name.length > 8 
                                ? `${attachment.name.substring(0, 5)}...` 
                                : attachment.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Message Text */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.message}
            </p>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-xs text-dark-400 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}
        >
          {time}
        </motion.div>
      </div>
    </motion.div>
  );
}