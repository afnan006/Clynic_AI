import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Trash2, Download, Filter, ToggleLeft, ToggleRight } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  data: any;
  level: 'info' | 'warn' | 'error' | 'success';
  normalDescription?: string; // Human-readable description for normal mode
}

interface DevConsoleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DevConsole({ isOpen, onToggle }: DevConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [displayMode, setDisplayMode] = useState<'normal' | 'technical'>('normal');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const categories = ['ALL', 'ENCRYPTION', 'AUTH', 'API', 'UI', 'CHAT_INPUT', 'CHAT', 'ASSESSMENT', 'SYSTEM', 'ERROR', 'CHAT_API', 'ENCRYPTION_AUDIT'];

  useEffect(() => {
    // Set up global dev console logger
    (window as any).devConsole = {
      log: (category: string, action: string, data: any, level: 'info' | 'warn' | 'error' | 'success' = 'info', normalDescription?: string) => {
        const logEntry: LogEntry = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          category,
          action,
          data,
          level,
          normalDescription
        };
        
        setLogs(prev => [...prev, logEntry]);
      }
    };

    // Initial log
    (window as any).devConsole.log('SYSTEM', 'DevConsole Initialized', {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: ['Normal Mode', 'Technical Mode', 'Enhanced Logging', 'Encryption Monitoring']
    }, 'success', 'Developer console is now ready with user-friendly and technical viewing modes');

    return () => {
      delete (window as any).devConsole;
    };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === '' || 
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.category.toLowerCase().includes(filter.toLowerCase()) ||
      (log.normalDescription && log.normalDescription.toLowerCase().includes(filter.toLowerCase())) ||
      JSON.stringify(log.data).toLowerCase().includes(filter.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    
    return matchesFilter && matchesCategory;
  });

  const clearLogs = () => {
    setLogs([]);
    (window as any).devConsole?.log('SYSTEM', 'Logs Cleared', { 
      timestamp: new Date().toISOString(),
      clearedCount: logs.length
    }, 'info', `Cleared ${logs.length} log entries from the console`);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dev-console-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    (window as any).devConsole?.log('SYSTEM', 'Logs Exported', { 
      filename: exportFileDefaultName,
      logCount: logs.length,
      timestamp: new Date().toISOString() 
    }, 'success', `Successfully exported ${logs.length} log entries to ${exportFileDefaultName}`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'warn': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const formatNormalDescription = (log: LogEntry) => {
    if (log.normalDescription) {
      return log.normalDescription;
    }

    // Fallback to generating a simple description from action
    switch (log.category) {
      case 'ENCRYPTION':
        if (log.action.includes('encrypt')) {
          return `Encrypted ${log.data.dataLength || 'unknown'} characters of text in ${log.data.encryptionTime || 'unknown'} time`;
        } else if (log.action.includes('decrypt')) {
          return `Decrypted ${log.data.encryptedLength || 'unknown'} bytes of data in ${log.data.decryptionTime || 'unknown'} time`;
        } else if (log.action.includes('generateIv')) {
          return `Generated a secure initialization vector for encryption`;
        } else if (log.action.includes('generateSalt')) {
          return `Generated a cryptographic salt for key derivation`;
        } else if (log.action.includes('deriveKey')) {
          return `Derived encryption key from password using ${log.data.iterations || 'many'} iterations`;
        }
        return `Encryption operation: ${log.action.toLowerCase()}`;
      
      case 'ENCRYPTION_AUDIT':
        return `Security audit: ${log.action.toLowerCase()}`;
        
      case 'AUTH':
        return `Authentication: ${log.action.toLowerCase()}`;
        
      case 'API':
        return `Server communication: ${log.action.toLowerCase()}`;
        
      case 'CHAT_INPUT':
        if (log.action.includes('STEP 1')) {
          return `User composed a message (${log.data.length} characters)`;
        } else if (log.action.includes('STEP 2')) {
          return `Generated secure encryption parameters`;
        } else if (log.action.includes('STEP 3')) {
          return `Encrypted message with AES-256-GCM`;
        } else if (log.action.includes('STEP 4')) {
          return `Prepared message for secure transmission`;
        } else if (log.action.includes('STEP 5')) {
          return `Message ready to send (encrypted in ${log.data.totalClientEncryptionTimeMs}ms)`;
        }
        return `Message input: ${log.action.toLowerCase()}`;
        
      case 'CHAT':
        if (log.action.includes('STEP 6')) {
          return `Message sent to server`;
        } else if (log.action.includes('STEP 7')) {
          return `Received encrypted response from server (${log.data.apiLatencyMs}ms)`;
        } else if (log.action.includes('STEP 8')) {
          return `Decrypting server response`;
        } else if (log.action.includes('STEP 8a')) {
          return `Preparing encrypted data for decryption`;
        } else if (log.action.includes('STEP 8b')) {
          return `Successfully decrypted server response`;
        } else if (log.action.includes('STEP 9')) {
          return `Message exchange completed in ${log.data.totalLatencySeconds}s`;
        }
        return `Chat system: ${log.action.toLowerCase()}`;
        
      case 'CHAT_API':
        if (log.action.includes('SERVER')) {
          return `Server processed encrypted message`;
        }
        return `Chat API: ${log.action.toLowerCase()}`;
        
      default:
        return log.action;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: isOpen ? -320 : 0 }}
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 p-3 bg-dark-800 border border-dark-700 rounded-xl text-primary-400 hover:text-primary-300 hover:bg-dark-700 transition-all duration-200 shadow-soft"
      >
        <Terminal className="w-5 h-5" />
      </motion.button>

      {/* Console Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-dark-900/95 backdrop-blur-xl border-l border-dark-700 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-primary-400" />
                <h3 className="text-white font-semibold">Dev Console</h3>
                <span className="text-xs text-dark-400 bg-dark-800 px-2 py-1 rounded">
                  {filteredLogs.length}
                </span>
              </div>
              <button
                onClick={onToggle}
                className="p-1 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-3 border-b border-dark-700 space-y-3">
              {/* Display Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-300">Display Mode:</span>
                <button
                  onClick={() => setDisplayMode(displayMode === 'normal' ? 'technical' : 'normal')}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                    displayMode === 'normal' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {displayMode === 'normal' ? (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span className="text-xs">Normal</span>
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span className="text-xs">Technical</span>
                    </>
                  )}
                </button>
              </div>

              {/* Filter Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <Filter className="absolute right-3 top-2.5 w-4 h-4 text-dark-400" />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={clearLogs}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors text-sm"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={exportLogs}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors text-sm"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Logs - Hidden scrollbar but scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-dark-400 py-8">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No logs to display</p>
                  <p className="text-xs mt-1">
                    Mode: <span className="text-primary-400">{displayMode}</span>
                  </p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border ${getLevelBg(log.level)} text-sm`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-dark-400">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="text-xs bg-dark-800 px-2 py-1 rounded text-dark-300">
                          {log.category}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    
                    {displayMode === 'normal' ? (
                      /* Normal Mode - User-friendly descriptions */
                      <div className="text-white text-sm leading-relaxed">
                        {formatNormalDescription(log)}
                      </div>
                    ) : (
                      /* Technical Mode - Detailed technical info */
                      <>
                        <div className="text-white font-medium mb-1">
                          {log.action}
                        </div>
                        
                        <pre className="text-xs text-dark-300 overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </>
                    )}
                  </motion.div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}