// p2pbackend/scripts/resetAdminPassword.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = 'admin@gmail.com';
    const newPassword = 'admin123';

    const admin = await User.findOne({ email });
    if (!admin) {
      console.error('Admin user not found:', email);
      process.exit(1);
    }

    admin.password = newPassword;
    await admin.save();

    console.log('Admin password reset to:', newPassword);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin password:', err.message);
    process.exit(1);
  }
};

run();
