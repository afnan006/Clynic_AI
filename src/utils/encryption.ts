/**
 * Core Encryption Utilities for HIPAA-compliant client-side encryption
 * Uses Web Crypto API with AES-256-GCM and PBKDF2 key derivation
 */

/**
 * Converts an ArrayBuffer to a Base64 string for storage/transmission
 * @param buffer The ArrayBuffer to convert
 * @returns The Base64 encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string back to an ArrayBuffer
 * @param base64 The Base64 string to convert
 * @returns The ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generates a cryptographically secure random salt
 * @param length The length of the salt in bytes (default: 16)
 * @returns A Promise resolving to a Uint8Array representing the salt
 */
export async function generateSalt(length: number = 16): Promise<Uint8Array> {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  
  // Log to developer console
  if (typeof window !== 'undefined' && (window as any).devConsole) {
    (window as any).devConsole.log('ENCRYPTION', 'generateSalt', {
      length,
      saltBase64: arrayBufferToBase64(salt.buffer),
      timestamp: new Date().toISOString()
    }, 'info', `Generated a new ${length}-byte cryptographic salt for secure key derivation`);
  }
  
  return salt;
}

/**
 * Generates a cryptographically secure random Initialization Vector (IV) for AES-GCM
 * @param length The length of the IV in bytes (default: 12 for AES-GCM)
 * @returns A Promise resolving to a Uint8Array representing the IV
 */
export async function generateIv(length: number = 12): Promise<Uint8Array> {
  const iv = new Uint8Array(length);
  crypto.getRandomValues(iv);
  
  // Log to developer console
  if (typeof window !== 'undefined' && (window as any).devConsole) {
    (window as any).devConsole.log('ENCRYPTION', 'generateIv', {
      length,
      ivBase64: arrayBufferToBase64(iv.buffer),
      timestamp: new Date().toISOString()
    }, 'info', `Generated a new ${length}-byte initialization vector for AES-GCM encryption`);
  }
  
  return iv;
}

/**
 * Derives a cryptographic key from a password and salt using PBKDF2
 * @param password The password string
 * @param salt The salt as a Uint8Array
 * @param iterations The number of PBKDF2 iterations (default: 310000)
 * @param keyLength The length of the derived key in bits (default: 256)
 * @returns A Promise resolving to a CryptoKey suitable for AES-256-GCM
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = 310000,
  keyLength: number = 256
): Promise<CryptoKey> {
  const startTime = performance.now();
  
  const passwordBuffer = new TextEncoder().encode(password);

  // Import the password as a key for PBKDF2
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: keyLength },
    false, // NOT extractable - critical security enhancement
    ['encrypt', 'decrypt']
  );

  const endTime = performance.now();
  
  // Generate a unique identifier for this key (for debugging)
  const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  // Log to developer console
  if (typeof window !== 'undefined' && (window as any).devConsole) {
    (window as any).devConsole.log('ENCRYPTION', 'deriveKey', {
      passwordLength: password.length,
      saltBase64: arrayBufferToBase64(salt.buffer),
      iterations,
      keyLength,
      derivationTime: `${(endTime - startTime).toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
      extractable: false,
      keyId: keyId // Add key identifier for tracking
    }, 'success', `Derived a ${keyLength}-bit encryption key from password using ${iterations.toLocaleString()} PBKDF2 iterations in ${(endTime - startTime).toFixed(0)}ms`);
  }

  // Store key identifier in a property on the key object for debugging
  (derivedKey as any).keyId = keyId;

  // Send audit log to server
  try {
    sendEncryptionAuditLog({
      operation: 'key_derivation',
      dataType: 'encryption_key',
      success: true,
      processingTimeMs: endTime - startTime,
      algorithm: 'PBKDF2-SHA256',
      keyDerivationTime: endTime - startTime,
      keyId: keyId // Include key identifier in audit log
    });
  } catch (error) {
    console.error('Failed to send encryption audit log', error);
  }

  return derivedKey;
}

/**
 * Encrypts data using AES-256-GCM
 * @param data The string data to encrypt
 * @param key The CryptoKey for encryption
 * @param iv The Initialization Vector as a Uint8Array
 * @returns A Promise resolving to an object containing the encrypted data and IV
 */
export async function encrypt(
  data: string,
  key: CryptoKey,
  iv: Uint8Array
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const startTime = performance.now();
  
  try {
    // Get key identifier if available
    const keyId = (key as any).keyId || 'unknown_key';
    
    const encoded = new TextEncoder().encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoded
    );

    const endTime = performance.now();
    
    // Log to developer console
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'encrypt', {
        dataLength: data.length,
        encryptedLength: encryptedData.byteLength,
        ivBase64: arrayBufferToBase64(iv.buffer),
        encryptionTime: `${(endTime - startTime).toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        algorithm: 'AES-256-GCM',
        keyId: keyId // Include key identifier
      }, 'success', `Encrypted ${data.length} characters of text into ${encryptedData.byteLength} bytes using AES-256-GCM in ${(endTime - startTime).toFixed(0)}ms with key ${keyId}`);
    }

    // Send audit log to server
    sendEncryptionAuditLog({
      operation: 'encrypt',
      dataType: 'message',
      success: true,
      processingTimeMs: endTime - startTime,
      dataSize: data.length,
      algorithm: 'AES-256-GCM',
      keyId: keyId // Include key identifier
    });

    return { encryptedData, iv };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown encryption error';
    
    // Get key identifier if available
    const keyId = (key as any).keyId || 'unknown_key';
    
    // Log encryption failure
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'encrypt_failed', {
        error: errorMessage,
        dataLength: data.length,
        timestamp: new Date().toISOString(),
        keyId: keyId, // Include key identifier
        keyType: key ? key.type : 'unknown',
        keyAlgorithm: key ? key.algorithm : 'unknown',
        keyUsages: key ? key.usages : 'unknown'
      }, 'error', `Failed to encrypt data with key ${keyId}: ${errorMessage}`);
    }

    // Send audit log to server
    sendEncryptionAuditLog({
      operation: 'encrypt',
      dataType: 'message',
      success: false,
      errorMessage: errorMessage,
      processingTimeMs: performance.now() - startTime,
      dataSize: data.length,
      algorithm: 'AES-256-GCM',
      keyId: keyId // Include key identifier
    });

    // Show security alert to user
    showSecurityAlert('Encryption Failed', 'Unable to encrypt your data securely. Please try again or contact support if the issue persists.');
    
    throw error;
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData The encrypted data as an ArrayBuffer
 * @param key The CryptoKey for decryption
 * @param iv The Initialization Vector as a Uint8Array
 * @returns A Promise resolving to the decrypted data as a string
 */
export async function decrypt(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const startTime = performance.now();
  
  try {
    // Get key identifier if available
    const keyId = (key as any).keyId || 'unknown_key';
    
    // Enhanced logging for debugging
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'decrypt_start', {
        encryptedLength: encryptedData.byteLength,
        ivLength: iv.length,
        ivBase64: arrayBufferToBase64(iv.buffer),
        ivFirstBytes: Array.from(iv.slice(0, 4)),
        encryptedFirstBytes: Array.from(new Uint8Array(encryptedData.slice(0, 16))),
        keyId: keyId,
        keyType: key.type,
        keyAlgorithm: key.algorithm,
        keyUsages: key.usages,
        timestamp: new Date().toISOString()
      }, 'info', `Starting decryption of ${encryptedData.byteLength} bytes with key ${keyId}`);
    }

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );

    const result = new TextDecoder().decode(decryptedData);
    const endTime = performance.now();
    
    // Log to developer console
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'decrypt', {
        encryptedLength: encryptedData.byteLength,
        decryptedLength: result.length,
        ivBase64: arrayBufferToBase64(iv.buffer),
        decryptionTime: `${(endTime - startTime).toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
        algorithm: 'AES-256-GCM',
        keyId: keyId, // Include key identifier
        resultPreview: result.substring(0, 30) + (result.length > 30 ? '...' : '')
      }, 'success', `Decrypted ${encryptedData.byteLength} bytes back to ${result.length} characters of readable text in ${(endTime - startTime).toFixed(0)}ms using key ${keyId}`);
    }

    // Send audit log to server
    sendEncryptionAuditLog({
      operation: 'decrypt',
      dataType: 'message',
      success: true,
      processingTimeMs: endTime - startTime,
      dataSize: encryptedData.byteLength,
      algorithm: 'AES-256-GCM',
      keyId: keyId // Include key identifier
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown decryption error';
    
    // Get key identifier if available
    const keyId = (key as any).keyId || 'unknown_key';
    
    // Log decryption failure with detailed information
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'decrypt_failed', {
        error: errorMessage,
        encryptedLength: encryptedData.byteLength,
        ivLength: iv.length,
        ivBase64: arrayBufferToBase64(iv.buffer),
        ivFirstBytes: Array.from(iv.slice(0, 4)),
        encryptedFirstBytes: Array.from(new Uint8Array(encryptedData.slice(0, 16))),
        timestamp: new Date().toISOString(),
        keyId: keyId, // Include key identifier
        keyType: key ? key.type : 'unknown',
        keyAlgorithm: key ? key.algorithm : 'unknown',
        keyUsages: key ? key.usages : 'unknown'
      }, 'error', `Failed to decrypt data with key ${keyId}: ${errorMessage}`);
    }

    // Send audit log to server
    sendEncryptionAuditLog({
      operation: 'decrypt',
      dataType: 'message',
      success: false,
      errorMessage: errorMessage,
      processingTimeMs: performance.now() - startTime,
      dataSize: encryptedData.byteLength,
      algorithm: 'AES-256-GCM',
      keyId: keyId // Include key identifier
    });

    // Show security alert to user
    showSecurityAlert('Decryption Failed', 'Unable to decrypt incoming data. This could indicate a security issue. Please try again or contact support if the issue persists.');
    
    throw error;
  }
}

/**
 * Send encryption audit log to server
 */
async function sendEncryptionAuditLog(logData: {
  operation: string;
  dataType: string;
  success: boolean;
  errorMessage?: string;
  processingTimeMs: number;
  dataSize?: number;
  algorithm?: string;
  keyDerivationTime?: number;
  keyId?: string; // Added key identifier
}): Promise<void> {
  try {
    // Get user ID if available
    let userId = null;
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        userId = user.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }

    // Prepare log data
    const auditLog = {
      ...logData,
      userId,
      ipAddress: 'client-side', // This will be replaced by the server
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // In a real implementation, this would send the log to the server
    // For now, we'll just log it to the console
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION_AUDIT', 'Audit Log Created', auditLog, 'info', 
        `Created encryption audit log for ${logData.operation} operation (${logData.success ? 'success' : 'failed'})`);
    }

    // In a real implementation, you would send this to your server:
    // await fetch('/api/encryption-audit', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(auditLog)
    // });
  } catch (error) {
    console.error('Failed to send encryption audit log', error);
  }
}

/**
 * Show security alert to user
 */
function showSecurityAlert(title: string, message: string): void {
  // In a real implementation, this would show a modal or toast notification
  // For now, we'll just log it to the console
  console.error(`SECURITY ALERT: ${title} - ${message}`);
  
  // Dispatch a custom event that can be caught by the application
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('securityAlert', { 
      detail: { title, message, timestamp: new Date().toISOString() } 
    });
    window.dispatchEvent(event);
  }
}

/**
 * Test function to verify all encryption utilities work correctly
 */
export async function testEncryptionUtilities(): Promise<boolean> {
  try {
    const testData = "Hello, this is a test message for encryption!";
    const testPassword = "test-password-123";
    
    // Generate salt and IV
    const salt = await generateSalt();
    const iv = await generateIv();
    
    // Derive key
    const key = await deriveKey(testPassword, salt);
    
    // Encrypt data
    const { encryptedData } = await encrypt(testData, key, iv);
    
    // Decrypt data
    const decryptedData = await decrypt(encryptedData, key, iv);
    
    // Verify data integrity
    const success = decryptedData === testData;
    
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'testEncryptionUtilities', {
        success,
        originalData: testData,
        decryptedData,
        dataMatches: success,
        timestamp: new Date().toISOString(),
        keyId: (key as any).keyId || 'unknown_key' // Include key identifier
      }, success ? 'success' : 'error', success 
        ? `Encryption test passed - successfully encrypted and decrypted test message "${testData}" with key ${(key as any).keyId || 'unknown_key'}` 
        : `Encryption test failed - decrypted data does not match original`);
    }
    
    return success;
  } catch (error) {
    if (typeof window !== 'undefined' && (window as any).devConsole) {
      (window as any).devConsole.log('ENCRYPTION', 'testEncryptionUtilities', {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 'error', `Encryption test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return false;
  }
}