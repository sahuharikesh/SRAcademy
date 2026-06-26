const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const auth      = require('./middleware/auth');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_LOCAL;

console.log(`🌐 Mode: ${process.env.NODE_ENV === 'production' ? 'Production (Atlas)' : 'Local'}`);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((e) => console.error('❌ MongoDB error:', e.message));

// Public
app.use('/api/auth', require('./routes/authRoutes'));

// Protected
app.use('/api/students',   auth, require('./routes/studentRoutes'));
app.use('/api/attendance', auth, require('./routes/attendanceRoutes'));
app.use('/api/fees',       auth, require('./routes/feeRoutes'));
app.use('/api/dashboard',  auth, require('./routes/dashboardRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
