// One-time migration: creates a User (academy account) in the DB for each
// admin that used to live in the ADMIN_EMAILS env var, so existing logins
// keep working after the switch to DB-backed, JWT-based auth.
//
// Usage: node scripts/seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_LOCAL;

// Update this list with the real admin(s) you want migrated, then delete
// this file once the migration has been run.
const SEED_USERS = [
  {
    academyName: 'Shree Ram Academy',
    name:        'Harikesh Sahu',
    email:       'sahuharikesh1@gmail.com',
    password:    '123456',
    upiId:       '8422053851@ybl',
  },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  for (const u of SEED_USERS) {
    const existing = await User.findOne({ email: u.email.toLowerCase() });
    if (existing) {
      console.log(`skip (already exists): ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`created: ${u.email}`);
  }
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
