const nodemailer = require('nodemailer');

// For this demo, we use a mock/console transporter if no credentials are provided.
// In production, replace with real values from .env (SendGrid, Mailgun, etc.)
const sendEmail = async (options) => {
  try {
    // Create a dummy transporter for the demo that logs to console
    // In a real app, this would be: 
    // const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, ... });
    
    console.log(`-----------------------------------------`);
    console.log(`📧 EMAIL SENT TO: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log(`-----------------------------------------`);

    // We still return success so the app flow continues
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

module.exports = sendEmail;
