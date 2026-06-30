const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema(
  {
    studentId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    adminEmail:     { type: String, required: true },
    examName:       { type: String, required: true },
    subject:        { type: String, required: true },
    std:            { type: String, required: true },
    maxMarks:       { type: Number, required: true },
    obtainedMarks:  { type: Number, default: null },
    date:           { type: Date,   required: true },
    absent:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

ResultSchema.index({ studentId: 1, examName: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);
