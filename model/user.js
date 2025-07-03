const mongoose = require('mongoose');

// Define the payment sub-schema
const accountSchema = new mongoose.Schema({
  cardHolderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  cvv: { type: String, required: true },
  expiryDate: { type: String, required: true }
}, { _id: false }); // prevent automatic _id for each payment entry

const otpSchema = new mongoose.Schema({
    otp: {type: Number, required: true},
    expiresAt: {type: Date, required: true}
})

// Define the user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  email_pass : {type: String, required: true},
  profile_pic_id: { type: String },
  token: { type: String },
  OTP: { type: otpSchema },
  next_payment_date: { type: Date, required: true }, // next payment date of user.
  payment_verified: { type: Boolean, required: true, default: false }, // true or false to check if it's verified --> default false
  freelancer: { type: Boolean, required: true },
  accountData: {
    type: accountSchema,
    required: false
  }
});

// Create the model
const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
