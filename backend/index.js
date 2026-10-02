const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

console.log('Environment initialized. JWT_SECRET found:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not found in .env. Using fallback for development.');
}

const { connectDB, sequelize } = require('./config/db');

// Import Models to sync
const User = require('./models/User');
const Document = require('./models/Document');
const DocumentShare = require('./models/DocumentShare');
const Notification = require('./models/Notification');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/share', require('./routes/shareRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Shorthand sharing route for cleaner links
app.get('/s/:token', require('./controllers/shareController').accessSharedDocument);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Sync database
  try {
    // 1. Initial sync - creates tables if they don't exist
    await sequelize.sync({ force: false });
    console.log('Database tables synchronized.');
    
    // 2. Safe Column Migrations for SQLite
    // Using a more robust check for each column
    const checkAndAddColumn = async (tableName, columnName, dataType, defaultValue = null) => {
      try {
        const tableInfo = await sequelize.getQueryInterface().describeTable(tableName);
        if (!tableInfo[columnName]) {
          console.log(`Adding missing column: ${columnName} to ${tableName}...`);
          let query = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType}`;
          if (defaultValue !== null) {
            query += ` DEFAULT ${defaultValue}`;
          }
          await sequelize.query(query + ';');
        }
      } catch (e) {
        // If table doesn't exist yet, we just skip (sync should have handled it)
        if (!e.message.includes('no such table')) {
          console.error(`Error migrating ${columnName}:`, e.message);
        }
      }
    };

    // Run safe migrations for Users table
    await checkAndAddColumn('Users', 'phoneNumber', 'TEXT');
    await checkAndAddColumn('Users', 'role', 'TEXT', "'user'");
    await checkAndAddColumn('Users', 'isEmailVerified', 'BOOLEAN', '0');
    await checkAndAddColumn('Users', 'twoFactorEnabled', 'BOOLEAN', '0');
    await checkAndAddColumn('Users', 'otpCode', 'TEXT');
    await checkAndAddColumn('Users', 'otpExpiry', 'DATETIME');
    
    console.log('Database schema verified and ready.');
  } catch (error) {
    console.error('CRITICAL: Database initialization failed:', error.message);
    // We don't exit here to allow potential connection retries or partial functionality, 
    // but in a production app we might.
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (Access via ${PORT})`);
  });
};

startServer();
