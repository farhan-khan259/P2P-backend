// p2pbackend/seed.js

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Product = require('./models/Product');
const productSeedData = require('./data/productSeedData');

/**
 * Seed database with admin user
 * Runs on server startup to ensure admin user exists
 */
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (adminExists) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('✓ Admin user seeded successfully');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
  } catch (error) {
    console.error('✗ Error seeding admin user:', error.message);
    throw error;
  }
};

const seedProducts = async () => {
  const existingCount = await Product.countDocuments();

  if (existingCount > 0) {
    console.log('✓ Product catalog already exists');
    return;
  }

  await Product.insertMany(productSeedData);
  console.log(`✓ Seeded ${productSeedData.length} products`);
};

/**
 * Standalone seed execution (when running via npm run seed)
 */
const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    await seedAdmin();
    await seedProducts();

    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed script failed:', error.message);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = seedAdmin;
