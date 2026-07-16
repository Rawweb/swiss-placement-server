import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dns from 'dns';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedCoordinator = async () => {
  try {
    await connectDB();

    const name = process.env.COORDINATOR_NAME;
    const email = process.env.COORDINATOR_EMAIL;
    const password = process.env.COORDINATOR_PASSWORD;
    if (!name || !email || !password) {
      console.log('Coordinator credentials missing in .env. Aborting.');
      process.exit(1);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Coordinator already exists. Nothing to do.');
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullName: name,
      email,
      password: hashedPassword,
      role: 'coordinator',
    });

    console.log('Coordinator account created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedCoordinator();
