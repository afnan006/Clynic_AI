import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Search, ArrowUp, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { generateIv, encrypt, arrayBufferToBase64 } from '../../utils/encryption';
import { AttachmentPreview } from '../../api/chat/types';

interface AttachedFile {
  file: File;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface ChatInputProps {
  onSendMessage: (message: string | { encryptedData: string; iv: string; originalMessage: string; attachedFiles?: AttachmentPreview[] }) => void;
  onMicClick?: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onMicClick, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { authState, getEncryptionKey } = useAuth();

  // Memoize encryption status to prevent repeated checks
  const encryptionStatus = useMemo(() => {
    const hasUser = !!authState.user;
    const hasKey = !!getEncryptionKey();
    const isKeyDerived = authState.isKeyDerived;
    
    return {
      hasUser,
      hasKey,
      isKeyDerived,
      canEncrypt: hasUser && hasKey && isKeyDerived,
      statusText: hasUser && hasKey && isKeyDerived 
        ? '🔒 End-to-End Encrypted' 
        : hasUser 
          ? '⚠️ Encryption Initializing...' 
          : '🔓 Demo Mode'
    };
  }, [authState.user, authState.isKeyDerived, getEncryptionKey]);

  // Auto-focus the textarea when component mounts or after sending a message
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [message]);

  const logToConsole = (action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('CHAT_INPUT', action, {
        ...data,
        timestamp: new Date().toISOString()
      }, level);
    }
  };

  const handleAttachmentClick = () => {
    // Don't allow attachments if search is active
    if (isSearchActive) return;
    
    logToConsole('Attachment Button Clicked', {
      isSearchActive,
      attachedFilesCount: attachedFiles.length
    }, 'info');
    
    fileInputRef.current?.click();
    setShowMoreOptions(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Only add files if we have less than 2 attachments
      if (attachedFiles.length >= 2) {
        logToConsole('File Selection Rejected', {
          reason: 'Maximum attachments reached',
          currentCount: attachedFiles.length,
          maxAllowed: 2
        }, 'warn');
        return;
      }
      
      const file = files[0];
      
      // Create file preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      const attachedFileData: AttachedFile = {
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        preview
      };

      logToConsole('File Selected', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasPreview: !!preview,
        previewUrl: preview?.substring(0, 100),
        currentAttachments: attachedFiles.length
      }, 'info');

      setAttachedFiles(prev => [...prev, attachedFileData]);
      
      // Disable search when adding attachments
      if (isSearchActive) {
        setIsSearchActive(false);
      }
      
      // Clear the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (fileToRemove: AttachedFile) => {
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
    
    logToConsole('File Attachment Removed', {
      fileName: fileToRemove.name,
      remainingAttachments: attachedFiles.length - 1
    }, 'info');
  };

  const handleMicClick = () => {
    logToConsole('Mic Button Clicked', {}, 'info');
    if (onMicClick) {
      onMicClick();
    } else {
      // Fallback behavior
      console.log('Mic clicked - voice recording not implemented yet');
    }
  };

  const handleSearchClick = () => {
    // Don't allow search if there are attachments
    if (attachedFiles.length > 0) return;
    
    setIsSearchActive(!isSearchActive);
    setShowMoreOptions(false);
    
    logToConsole('Search Button Clicked', {
      newState: !isSearchActive,
      searchActive: !isSearchActive,
      hasAttachments: attachedFiles.length > 0
    }, 'info');
    
    // TODO: Implement internet search functionality
    console.log('Search clicked - internet search not implemented yet');
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachedFiles.length === 0) || disabled || isSearchActive) return;

    const originalMessage = message.trim();
    const startTime = performance.now();

    logToConsole('📝 STEP 1: Original User Message', {
      message: originalMessage,
      length: originalMessage.length,
      encoding: 'UTF-8 plain text',
      canEncrypt: encryptionStatus.canEncrypt,
      hasAttachments: attachedFiles.length > 0,
      attachmentNames: attachedFiles.map(file => file.name)
    }, 'info');

    // Clear input and attachment immediately for better UX
    setMessage('');
    
    // Convert attachedFiles to AttachmentPreview format
    const attachmentPreviews: AttachmentPreview[] = attachedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.preview
    }));
    
    const filesToClear = [...attachedFiles];
    setAttachedFiles([]);

    // Revoke object URLs for any image previews
    filesToClear.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    // Check encryption capability
    if (!encryptionStatus.canEncrypt) {
      logToConsole('🔒 ENCRYPTION REQUIRED', {
        reason: !authState.user ? 'No user authenticated' : 'Encryption key not available',
        securityBlock: true
      }, 'error');
      
      // Show security alert to user
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('securityAlert', { 
          detail: { 
            title: 'Encryption Required', 
            message: 'Your message could not be sent because end-to-end encryption is required. Please sign in again to re-establish secure encryption.',
            timestamp: new Date().toISOString() 
          } 
        });
        window.dispatchEvent(event);
      }
      
      return;
    }

    try {
      const encryptionKey = getEncryptionKey()!; // We know it exists from encryptionStatus.canEncrypt
      
      // Log key identifier for debugging
      const keyId = (encryptionKey as any).keyId || 'unknown_key';
      logToConsole('🔑 Using Encryption Key', {
        keyId: keyId,
        keyType: encryptionKey.type,
        keyAlgorithm: encryptionKey.algorithm,
        keyUsages: encryptionKey.usages
      }, 'info');

      // Step 2: Generate IV
      const ivGenerationStart = performance.now();
      const iv = await generateIv();
      const ivGenerationTime = performance.now() - ivGenerationStart;

      logToConsole('🔑 STEP 2: IV Generation Complete', {
        ivBase64: arrayBufferToBase64(iv.buffer),
        ivLength: iv.length,
        generationTimeMs: ivGenerationTime.toFixed(2),
        algorithm: 'Cryptographically secure random'
      }, 'success');

      // Step 3: Encrypt the message
      const encryptionStart = performance.now();
      const messageToEncrypt = originalMessage || '[File attachment]';
      const { encryptedData } = await encrypt(messageToEncrypt, encryptionKey, iv);
      const encryptionTime = performance.now() - encryptionStart;

      logToConsole('🔐 STEP 3: Message Encryption Complete', {
        originalLength: messageToEncrypt.length,
        encryptedLength: encryptedData.byteLength,
        algorithm: 'AES-256-GCM',
        encryptionTimeMs: encryptionTime.toFixed(2),
        compressionRatio: (encryptedData.byteLength / messageToEncrypt.length).toFixed(2),
        securityLevel: 'Military-grade',
        keyId: keyId // Include key identifier
      }, 'success');

      // Step 4: Convert to Base64 for transmission
      const base64ConversionStart = performance.now();
      const encryptedDataBase64 = arrayBufferToBase64(encryptedData);
      const ivBase64 = arrayBufferToBase64(iv.buffer);
      const base64ConversionTime = performance.now() - base64ConversionStart;

      logToConsole('📦 STEP 4: Base64 Encoding Complete', {
        encryptedDataBase64Preview: encryptedDataBase64.substring(0, 50) + '...',
        encryptedDataBase64Length: encryptedDataBase64.length,
        ivBase64,
        ivBase64Length: ivBase64.length,
        totalPayloadSize: encryptedDataBase64.length + ivBase64.length,
        encodingTimeMs: base64ConversionTime.toFixed(2),
        readyForTransmission: true
      }, 'success');

      // Step 5: Prepare encrypted payload - Include originalMessage for demo purposes
      const payload = {
        encryptedData: encryptedDataBase64,
        iv: ivBase64,
        originalMessage: messageToEncrypt, // Include original message for demo purposes
        attachedFiles: attachmentPreviews.length > 0 ? attachmentPreviews : undefined
      };

      const totalClientTime = performance.now() - startTime;

      logToConsole('🚀 STEP 5: Encrypted Payload Ready', {
        payloadKeys: Object.keys(payload),
        totalClientEncryptionTimeMs: totalClientTime.toFixed(2),
        totalClientEncryptionTimeSeconds: (totalClientTime / 1000).toFixed(3),
        securityStatus: 'ENCRYPTED',
        transmissionReady: true,
        keyId: keyId, // Include key identifier
        hasAttachments: !!payload.attachedFiles,
        attachmentCount: payload.attachedFiles?.length || 0
      }, 'success');

      // Send encrypted message
      onSendMessage(payload);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown encryption error';
      
      logToConsole('❌ ENCRYPTION FAILED - CRITICAL ERROR', {
        error: errorMessage,
        originalMessage: originalMessage.substring(0, 50) + '...',
        securityCompromised: true
      }, 'error');

      // Show security alert to user
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('securityAlert', { 
          detail: { 
            title: 'Encryption Failed', 
            message: 'Your message could not be encrypted securely. Please try again or contact support if the issue persists.',
            timestamp: new Date().toISOString() 
          } 
        });
        window.dispatchEvent(event);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 p-4"
    >
      <div className="container mx-auto max-w-4xl">
        {/* More Options Overlay */}
        <AnimatePresence>
          {showMoreOptions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 left-4 bg-dark-800/90 backdrop-blur-xl border border-dark-700/50 rounded-2xl shadow-soft-xl p-2 z-10"
            >
              <div className="flex flex-col space-y-1">
                {/* Attach File */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAttachmentClick}
                  disabled={disabled || !encryptionStatus.canEncrypt || isSearchActive || attachedFiles.length >= 2}
                  className={`flex items-center space-x-3 px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-700/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                    attachedFiles.length > 0 ? 'bg-primary-500/10 text-primary-400' : ''
                  }`}
                >
                  <Paperclip className="w-4 h-4 flex-shrink-0" />
                  <span>Attach File {attachedFiles.length > 0 ? `(${attachedFiles.length}/2)` : ''}</span>
                </motion.button>

                {/* Search */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSearchClick}
                  disabled={disabled || !encryptionStatus.canEncrypt || attachedFiles.length > 0}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                    isSearchActive 
                      ? 'text-blue-400 bg-blue-500/20 border border-blue-500/30' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }`}
                >
                  <Search className="w-4 h-4 flex-shrink-0" />
                  <span>Search</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Form */}
        <form 
          onSubmit={handleSubmit} 
          className="relative flex flex-col bg-dark-800/50 border border-dark-700/50 rounded-2xl shadow-soft-lg backdrop-blur-xl"
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,application/pdf,.txt,.doc,.docx"
          />

          {/* File Attachment Previews */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2 p-3 border-b border-dark-700/50"
              >
                {attachedFiles.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative w-20 h-20 flex-shrink-0"
                  >
                    {/* File Preview */}
                    <div className="w-full h-full rounded-lg overflow-hidden bg-dark-700 border border-dark-600 flex items-center justify-center">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-dark-400">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveAttachment(file)}
                      className="absolute -top-2 -right-2 p-1 bg-dark-800 text-dark-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10 border border-dark-700"
                      aria-label="Remove attachment"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                    
                    {/* File Name Tooltip */}
                    <div className="absolute -bottom-1 left-0 right-0 bg-dark-800/90 text-xs text-center py-0.5 px-1 truncate rounded-b-lg">
                      {file.name.length > 10 ? `${file.name.substring(0, 7)}...` : file.name}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end min-h-[48px]">
            {/* Left - More Options Arrow / Search Icon */}
            <div className="flex items-end pl-3 pb-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                disabled={disabled || !encryptionStatus.canEncrypt}
                className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-dark-700/50 ${
                  showMoreOptions 
                    ? 'text-primary-400 bg-primary-500/20' 
                    : isSearchActive
                      ? 'text-blue-400 bg-blue-500/20'
                      : 'text-dark-400 hover:text-primary-400'
                }`}
                aria-label={isSearchActive ? "Search active" : "More options"}
                aria-expanded={showMoreOptions}
              >
                {isSearchActive ? (
                  <Search className="w-5 h-5" />
                ) : (
                  <motion.div
                    animate={{ rotate: showMoreOptions ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={encryptionStatus.canEncrypt 
                ? isSearchActive
                  ? "Search the web..."
                  : "Type your encrypted message..." 
                : "Sign in to enable secure messaging"
              }
              disabled={disabled || !encryptionStatus.canEncrypt || isSearchActive}
              className="
                flex-1 px-4 py-3 resize-none text-white placeholder-dark-400 bg-transparent 
                focus:outline-none min-h-[48px] max-h-[120px]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              style={{
                overflowY: message.length > 50 ? 'auto' : 'hidden',
              }}
            />
            
            {/* Right buttons container */}
            <div className="flex items-end pr-3 pb-2 space-x-2">
              {/* Mic button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleMicClick}
                disabled={disabled || !encryptionStatus.canEncrypt || isSearchActive}
                className="p-2 text-dark-400 hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-dark-700/50"
                aria-label="Voice message"
              >
                <Mic className="w-5 h-5" />
              </motion.button>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={(!message.trim() && attachedFiles.length === 0) || disabled || !encryptionStatus.canEncrypt || isSearchActive}
                className="
                  p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:bg-dark-600 shadow-soft
                "
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}