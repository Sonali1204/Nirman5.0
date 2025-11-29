const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'), // Database file
  logging: false, // Set to true to see SQL queries in console
  define: {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connected successfully!');
    
    // Sync all models with database
    await sequelize.sync({ force: false }); // Set force: true to reset database
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ SQLite connection error:', error);
  }
};

module.exports = { sequelize, connectDB };