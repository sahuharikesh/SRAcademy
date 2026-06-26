const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    studentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date:             { type: Date,   required: true },
    status:           { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
    notificationSent: { type: Boolean, default: false },
    adminEmail:       { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
