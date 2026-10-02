const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.concat([
  Buffer.from(process.env.JWT_SECRET || 'fallback_secret_key_minimum_32_characters_long_for_dev'), 
  Buffer.alloc(32)
], 32); // Ensure 32 bytes
const IV_LENGTH = 16;

/**
 * Encrypts a buffer using AES-256-CBC
 * @param {Buffer} buffer 
 * @returns {Buffer}
 */
exports.encrypt = (buffer) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return encrypted;
};

/**
 * Decrypts a buffer using AES-256-CBC
 * @param {Buffer} buffer 
 * @returns {Buffer}
 */
exports.decrypt = (buffer) => {
  const iv = buffer.slice(0, IV_LENGTH);
  const encryptedData = buffer.slice(IV_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted;
};

/**
 * Computes SHA-256 hash of a buffer
 * @param {Buffer} buffer 
 * @returns {string}
 */
exports.computeHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
