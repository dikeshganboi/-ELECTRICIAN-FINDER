#!/usr/bin/env node

/**
 * Database Setup Script for Production
 * Creates admin user and sets up initial data
 * 
 * Usage:
 * 1. Set MONGODB_URI environment variable
 * 2. Run: node setup-database.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, enum: ['user', 'electrician', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function setupDatabase() {
  try {
    console.log('\n🚀 Electrician Finder - Database Setup\n');
    
    // Get MongoDB URI
    const mongoUri = process.env.MONGODB_URI || await question('Enter MongoDB URI: ');
    
    // Connect to database
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');
    
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', adminExists.email);
      
      const recreate = await question('\nRecreate admin user? (yes/no): ');
      if (recreate.toLowerCase() !== 'yes') {
        console.log('\n✅ Setup complete!');
        process.exit(0);
      }
      
      await User.deleteOne({ _id: adminExists._id });
      console.log('🗑️  Old admin user deleted');
    }
    
    // Create admin user
    console.log('\n👤 Create Admin User\n');
    
    const name = await question('Admin Name: ');
    const email = await question('Admin Email: ');
    const password = await question('Admin Password: ');
    const phone = await question('Admin Phone: ');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'admin'
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📝 Admin Details:');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   ID:', admin._id);
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n⚠️  Keep these credentials safe!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
