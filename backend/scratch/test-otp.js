const { sequelize, connectDB } = require('../config/db');
const User = require('../models/User');

async function test() {
  await connectDB();
  
  try {
    const email = 'test_otp@example.com';
    // 1. Cleanup
    await User.destroy({ where: { email } });
    
    // 2. Create User
    console.log('Creating test user...');
    const user = await User.create({
      name: 'Test User',
      email: email,
      password: 'password123',
    });
    
    // 3. Set OTP
    const otp = '123456';
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    user.otpCode = otp;
    user.otpExpiry = expiry;
    await user.save();
    console.log(`Saved OTP: ${otp}, Expiry: ${expiry.toISOString()}`);
    
    // 4. Fetch User Again
    console.log('Fetching user back from DB...');
    const fetchedUser = await User.findOne({ where: { email } });
    
    console.log(`FETCHED DATA:`);
    console.log(`OTP Code: "${fetchedUser.otpCode}" (Type: ${typeof fetchedUser.otpCode})`);
    console.log(`OTP Expiry: "${fetchedUser.otpExpiry}" (Type: ${typeof fetchedUser.otpExpiry})`);
    console.log(`Expiry Object:`, new Date(fetchedUser.otpExpiry).toString());
    
    const isMatch = fetchedUser.otpCode === otp;
    const isNotExpired = new Date() < new Date(fetchedUser.otpExpiry);
    
    console.log(`Final Test - Match: ${isMatch}, Not Expired: ${isNotExpired}`);
    
    if (isMatch && isNotExpired) {
      console.log('✅ DATABASE PERSISTENCE AND COMPARISON WORKS LOCALLY');
    } else {
      console.log('❌ DATABASE PERSISTENCE OR COMPARISON FAILED');
    }

  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    process.exit();
  }
}

test();
