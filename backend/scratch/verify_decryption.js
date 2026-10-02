// Manual env for testing - MUST BE SET BEFORE REQUIRING SECURITY.JS
process.env.JWT_SECRET = 'your_super_secret_jwt_key_here';

const fs = require('fs');
const path = require('path');
const { decrypt } = require('../utils/security');

const uploadsDir = path.join(__dirname, '../uploads');
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.enc'));

if (files.length === 0) {
    console.log('No encrypted files found.');
    process.exit(0);
}

const testFile = files[0];
const filePath = path.join(uploadsDir, testFile);
const encryptedBuffer = fs.readFileSync(filePath);

try {
    const decryptedBuffer = decrypt(encryptedBuffer);
    console.log(`Successfully decrypted ${testFile}`);
    console.log(`Original size: ${encryptedBuffer.length}, Decrypted size: ${decryptedBuffer.length}`);
    if (decryptedBuffer.length > 0) {
        console.log('Verification PASSED: Decrypted buffer is not empty.');
    } else {
        console.log('Verification FAILED: Decrypted buffer is empty.');
    }
} catch (error) {
    console.error(`Verification FAILED for ${testFile}:`, error.message);
}
