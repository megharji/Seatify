require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const { ROLES } = require('./constants');

async function seedAdmin() {
  await connectDB();

  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: process.env.DEFAULT_ADMIN_NAME || 'Admin',
    email,
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
    role: ROLES.ADMIN
  });

  console.log('Admin created successfully');
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error('Admin seed failed:', error);
  process.exit(1);
});
