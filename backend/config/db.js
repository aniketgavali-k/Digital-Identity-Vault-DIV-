const { Sequelize } = require('sequelize');
const path = require('path');
// Configuration is loaded in the entry point (index.js)
const sqlitePath = process.env.SQLITE_DB_PATH || './database.sqlite';

// Robust path resolution for database file
const storagePath = path.isAbsolute(sqlitePath) 
  ? sqlitePath 
  : path.resolve(__dirname, '..', sqlitePath);

console.log('Database Path:', storagePath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
