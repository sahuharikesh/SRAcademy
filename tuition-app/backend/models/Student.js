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
    medium:          { type: String, enum: ['Hindi', 'English', 'Semi-English', ''], default: '' },
    schoolName:      { type: String, default: '' },
    comment:         { type: String, default: '' },
    isActive:        { type: Boolean, default: true },
    adminEmail:      { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate active students with same name+mobile+std per admin
StudentSchema.index(
  { adminEmail: 1, mobile: 1, std: 1, name: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model('Student', StudentSchema);
