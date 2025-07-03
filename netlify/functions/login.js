import userModel from '../../model/user.js';
import { connect, disconnect } from './lib/db.js';
import generateOTP from './lib/utils/generateOtp.js';
import companyEmailSender from './lib/utils/companyEmailSender.js';
import otpTemplate from './lib/emailTemplate/otpTemplate.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const { email } = JSON.parse(event.body || '{}');

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }) };
  }

  try {
    await connect();

    const user = await userModel.findOne({ email });
    if (!user) {
      await disconnect();
      return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
    }

    const { otp, expiresAt } = generateOTP();
    user.OTP = { otp, expiresAt };
    await user.save();

    await companyEmailSender({
      to: email,
      subject: 'Login OTP - ClientFlow',
      html: otpTemplate({ username: user.name, otp })
    });

    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OTP sent to email', uuid: user._id })
    };
  } catch (err) {
    await disconnect();
    console.error('Request OTP Error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error', error: err.message }) };
  }
}
