// db/seedDatabase.js
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import directly from model files (not from models/index)
const User = require('../models/User');
const College = require('../models/College');
const Department = require('../models/Department');

async function seedDatabase() {
  try {
    // Create Super Admin
    const superAdmin = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@rpoly.rw',
      phone: '+250788000000',
      password: await bcrypt.hash('1234567890', 10),
      role: 'SUPER_ADMIN'
    });

    // Create College Admin
    const collegeAdmin = await User.create({
      firstName: 'College',
      lastName: 'Admin',
      email: 'admin@rptumba.rw',
      phone: '+250788111111',
      password: await bcrypt.hash('1234567890', 10),
      role: 'COLLEGE_ADMIN'
    });

    // Create RPTUMBA College
    const college = await College.create({
      name: 'Rwanda Polytechnic - Tumba College of Technology',
      code: 'RPTUMBA',
      location: 'Tumba',
      managerId: collegeAdmin.id,
      createdBy: superAdmin.id
    });

    // Create default departments
    const departments = [
      { name: 'Admissions', code: 'ADM', collegeId: college.id, order: 1 },
      { name: 'Academics', code: 'ACAD', collegeId: college.id, order: 2 },
      { name: 'Finance', code: 'FIN', collegeId: college.id, order: 3 },
      { name: 'Registrar', code: 'REG', collegeId: college.id, order: 4 },
      { name: 'General', code: 'GEN', collegeId: college.id, order: 5 }
    ];

    await Department.bulkCreate(departments);

    console.log('✅ Database seeded successfully!');
    console.log('📋 Login credentials:');
    console.log(`   Super Admin: admin@rpoly.rw / 1234567890`);
    console.log(`   College Admin: admin@rptumba.rw / 1234567890`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error.stack);
  }
}

module.exports = seedDatabase;