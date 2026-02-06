// models/index.js
const sequelize = require('../config/index');

// Import ALL models
const User = require('./User');
const College = require('./College');
const Department = require('./Department');
const Appointment = require('./Appointment');
const UserCollege = require('./UserCollege');

const models = {
  User,
  College, 
  Department,
  Appointment,
  UserCollege
};

// Initialize associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Sync in correct order
const syncDatabase = async () => {
  try {
    // Use alter: true for development
    await sequelize.sync();
    console.log('All tables created successfully');
    
  } catch (error) {
    console.error('Database sync error:', error);
  }
};

// Separate function for seeding
const seedDatabase = async () => {
  try {
    // Import seed function dynamically to avoid circular dependency
    const seedFunc = require('../db/seedDatabase');
    await seedFunc();
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Export
module.exports = {
  sequelize,
  ...models,
  syncDatabase,
  seedDatabase
};