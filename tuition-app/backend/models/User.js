const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    academyName:  { type: String, required: true },   // e.g. "Shree Ram Academy"
    academyTitle: { type: String, default: '' },        // e.g. tagline shown under the academy name
    name:         { type: String, required: true },     // admin / owner's name
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true },     // bcrypt hash
    mobile:       { type: String, default: '' },
    logoUrl:      { type: String, default: '' },
    signatureUrl: { type: String, default: '' },
    upiId:        { type: String, default: '' },
    primaryColor: { type: String, default: '#1a1a1a' },  // primary (dark/background) theme color
    themeColor:   { type: String, default: '#C9A84C' },  // secondary (accent/gold) theme color
    role:         { type: String, enum: ['super_admin', 'admin'], default: 'super_admin' },
    stdList:      {
      type: [String],
      default: ['Jr. KG', 'Sr. KG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
    }, // classes/standards this academy teaches
    subjectList:  {
      type: [String],
      default: ['Maths', 'Science', 'EVS-1', 'EVS-2', 'English', 'Marathi', 'Hindi', 'History/Civics', 'Geography', 'Sanskrit'],
    }, // subjects this academy offers
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function () {
  const { _id, academyName, academyTitle, name, email, mobile, logoUrl, signatureUrl, upiId, primaryColor, themeColor, role, stdList, subjectList, createdAt } = this;
  return { id: _id, academyName, academyTitle, name, email, mobile, logoUrl, signatureUrl, upiId, upiName: academyName, primaryColor, themeColor, role, stdList, subjectList, createdAt };
};

module.exports = mongoose.model('User', UserSchema);
