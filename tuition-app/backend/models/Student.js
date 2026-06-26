const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true },
    mobile:          { type: String, required: true },
    std:             { type: String, required: true },
    dateOfAdmission: { type: Date,   required: true },
    feeType:         { type: String, enum: ['Monthly', 'Yearly'], required: true },
    actualFees:      { type: Number, required: true },
    recommendedFees: { type: Number, required: true },
    groupNo:         { type: String, default: '' },
    isActive:        { type: Boolean, default: true },
    adminEmail:      { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
