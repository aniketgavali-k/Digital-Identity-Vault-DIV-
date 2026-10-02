const User = require('../models/User');
const { connectDB } = require('../config/db');

async function checkUsers() {
    try {
        // Need to connect to DB first for Sequelize
        // connectDB(); // This just logs, we need the connection to be established for the model
        
        const users = await User.findAll();
        console.log(`Total users in DB: ${users.length}`);
        users.forEach(u => {
            const pass = u.password || '';
            const isHashed = pass.startsWith('$2b$') || pass.startsWith('$2a$');
            console.log(`- Email: ${u.email}, Hashed: ${isHashed}, PassLength: ${pass.length}, isVerified: ${u.isEmailVerified}`);
        });
        process.exit(0);
    } catch (e) {
        console.error('Check failed:', e);
        process.exit(1);
    }
}

checkUsers();
