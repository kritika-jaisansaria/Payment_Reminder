const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
timezone: { type: String, default: 'UTC' },
  reminderTime: { type: String, default: '09:00' },
  // OTP details for verification
  otp: {
    code: String,
    expiresAt: Date, // OTP expiry time
  },

  otpResendCount: { type: Number, default: 0 },  // Number of times OTP resent
  otpResendLastTime: Date, // Timestamp of last OTP resend
}, {
  timestamps: true, // optional: adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('User', userSchema);
