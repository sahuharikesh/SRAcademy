const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema(
  {
    studentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    month:            { type: String },
    year:             { type: Number },
    dueDate:          { type: Date,   required: true },
    amount:           { type: Number, required: true },
    paidDate:         { type: Date },
    paidAmount:       { type: Number },
    status:           { type: String, enum: ['Upcoming', 'No Due', 'Partial', 'Paid', 'Overdue', 'Pending'], default: 'Upcoming' },
    notificationSent: { type: Boolean, default: false },
    comments:         { type: String, default: '' },
    adminEmail:       { type: String },
    paymentLogs: [{
      amount:           { type: Number },
      date:             { type: Date },
      totalCollected:   { type: Number },   // total cash taken in this session
      clearedPrevious:  [{ month: String, year: Number, amount: Number }],
    }],
  },
  { timestamps: true }
);

// Prevents two concurrent/duplicate refresh calls from ever creating two
// fee cycles for the same student + month + year.
FeeSchema.index({ studentId: 1, month: 1, year: 1, adminEmail: 1 }, { unique: true });

module.exports = mongoose.model('Fee', FeeSchema);
