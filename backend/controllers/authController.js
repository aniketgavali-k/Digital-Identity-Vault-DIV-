const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/email');
const { Op, fn, col, where } = require('sequelize');

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (user) => {
  const otp = generateOTP();
  const expiryTime = Date.now() + 20 * 60 * 1000; // 20 minutes from now

  user.otpCode = otp;
  user.otpExpiry = new Date(expiryTime); // Still store as date for DB but we'll use numeric comparison
  await user.save();

  console.log(`[AUTH-DEBUG] OTP generated for ${user.email}: ${otp} (Expiry Timestamp: ${expiryTime})`);

  await sendEmail({
    to: user.email,
    subject: 'Your Vault Verification Code',
    message: `Your One-Time Password (OTP) for Digital Identity Vault is: ${otp}. It will expire in 20 minutes.`,
  });
  
  return otp;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, password, role, phoneNumber } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    const userExists = await User.findOne({ 
      where: where(fn('LOWER', col('email')), email)
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      isEmailVerified: false,
    });

    if (user) {
      await sendOTPEmail(user);
      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        email: user.email,
        status: 'PENDING_VERIFICATION'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    const user = await User.findOne({ 
      where: where(fn('LOWER', col('email')), email)
    });

    if (user && (await user.comparePassword(password))) {
      // 1. Check if email is verified
      if (!user.isEmailVerified) {
        await sendOTPEmail(user);
        return res.json({
          status: 'VERIFICATION_REQUIRED',
          email: user.email,
          message: 'Please verify your email to continue.'
        });
      }

      // 2. Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        await sendOTPEmail(user);
        return res.json({
          status: '2FA_REQUIRED',
          email: user.email,
          message: 'Secondary verification required.'
        });
      }

      // 3. Normal login
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: signToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  try {
    const user = await User.findOne({ 
      where: where(fn('LOWER', col('email')), email)
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendOTPEmail(user);
    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  const { otpCode } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  try {
    console.log(`[VERIFY-OTP] Attempt for: ${email}`);
    const user = await User.findOne({ 
      where: where(fn('LOWER', col('email')), email)
    });

    if (!user) {
      console.log(`[VERIFY-OTP] User not found: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const trimmedReceived = String(otpCode || '').trim();
    const trimmedStored = String(user.otpCode || '').trim();
    const currentTime = Date.now();
    
    // Robust date parsing for SQLite/Sequelize
    let expiryTime = 0;
    if (user.otpExpiry) {
      const expiryDate = new Date(user.otpExpiry);
      expiryTime = expiryDate.getTime();
    }

    console.log(`--- OTP VERIFICATION DEBUG ---`);
    console.log(`Email: ${email}`);
    console.log(`Received Code: "${trimmedReceived}"`);
    console.log(`Stored Code:   "${trimmedStored}"`);
    console.log(`Current Time:  ${new Date(currentTime).toISOString()} (${currentTime})`);
    console.log(`Expiry Time:   ${expiryTime > 0 ? new Date(expiryTime).toISOString() : 'N/A'} (${expiryTime})`);
    
    // Strict comparison
    const isCodeMatch = trimmedStored !== '' && trimmedStored !== 'null' && trimmedStored === trimmedReceived;
    // Allow a small grace period (60 seconds) for clock drift or network lag
    const isNotExpired = expiryTime > 0 && currentTime <= (expiryTime + 60000);
    
    console.log(`Match Result: ${isCodeMatch}`);
    console.log(`Expiry Result: ${isNotExpired}`);
    console.log(`-------------------------------`);

    if (isCodeMatch && isNotExpired) {
      user.otpCode = null;
      user.otpExpiry = null;
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
      }
      await user.save();
      console.log(`[VERIFY-OTP] Success for ${email}`);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: signToken(user.id),
      });
    } else {
      let failReason = 'Invalid or expired verification code';
      if (!isCodeMatch) failReason = 'The code you entered is incorrect.';
      else if (!isNotExpired) failReason = 'The verification code has expired.';
      
      console.log(`[VERIFY-OTP] Failed for ${email}: ${failReason}`);
      res.status(400).json({ message: failReason });
    }
  } catch (error) {
    console.error('[VERIFY-OTP] Catch error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.role = req.body.role || user.role;
      user.twoFactorEnabled = req.body.twoFactorEnabled !== undefined ? req.body.twoFactorEnabled : user.twoFactorEnabled;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        twoFactorEnabled: updatedUser.twoFactorEnabled
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
