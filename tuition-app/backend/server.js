require('dotenv').config();

const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const auth      = require('./middleware/auth');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_LOCAL;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Drop stale indexes on results collection if they exist
    try {
      const col = mongoose.connection.collection('results');
      const indexes = await col.indexes();
      const stale = indexes.find(i => i.name === 'examId_1_studentId_1');
      if (stale) {
        await col.dropIndex('examId_1_studentId_1');
        console.log('🧹 Dropped stale index examId_1_studentId_1');
      }
    } catch (e) {
      // collection may not exist yet — ignore
    }
  })
  .catch((e) => console.error('❌ MongoDB error:', e.message));

// Public
app.use('/api/auth', require('./routes/authRoutes'));

// Protected
app.use('/api/students',   auth, require('./routes/studentRoutes'));
app.use('/api/attendance', auth, require('./routes/attendanceRoutes'));
app.use('/api/fees',       auth, require('./routes/feeRoutes'));
app.use('/api/dashboard',  auth, require('./routes/dashboardRoutes'));
app.use('/api/results',    auth, require('./routes/resultRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
