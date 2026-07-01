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
    status:           { type: String, enum: ['Upcoming', 'No Due', 'Partial', 'Paid', 'Overdue'], default: 'Upcoming' },
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

module.exports = mongoose.model('Fee', FeeSchema);
