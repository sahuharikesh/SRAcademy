const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const auth      = require('./middleware/auth');
require('dotenv').config();

const app = express();

// CORS — allow Vercel frontend + localhost dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

const MONGO_URI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_LOCAL;

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
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
