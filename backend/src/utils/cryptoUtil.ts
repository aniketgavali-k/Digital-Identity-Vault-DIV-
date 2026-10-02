import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'my-secret-key-that-is-32-bytes-long';

export const encryptBuffer = (buffer: Buffer): Buffer => {
  const words = CryptoJS.lib.WordArray.create(buffer);
  const encrypted = CryptoJS.AES.encrypt(words, ENCRYPTION_KEY).toString();
  return Buffer.from(encrypted, 'utf-8');
};

export const decryptBuffer = (buffer: Buffer): Buffer => {
  const encryptedStr = buffer.toString('utf-8');
  const decrypted = CryptoJS.AES.decrypt(encryptedStr, ENCRYPTION_KEY);
  
  // Convert WordArray to Buffer
  const words = decrypted.words;
  const sigBytes = decrypted.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    u8[i] = byte;
  }
  return Buffer.from(u8);
};

export const computeHash = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
