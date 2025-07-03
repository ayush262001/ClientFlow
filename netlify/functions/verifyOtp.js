import userModel from '../../model/user';
import { connect, disconnect } from './lib/db';
import validOtp from './lib/utils/validOtp.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  const { uuid } = event.queryStringParameters || {};
  const { otp: enteredOtp } = JSON.parse(event.body || '{}');

  if (!uuid || !enteredOtp) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'UUID and OTP are required' })
    };
  }

  try {
    await connect();

    const user = await userModel.findById(uuid).select('OTP');

    if (!user || !user.OTP) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User or OTP not found' })
      };
    }

    const isValid = validOtp(enteredOtp, user.OTP.otp, user.OTP.expiresAt);

    if (!isValid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid or expired OTP' })
      };
    }

    await userModel.findByIdAndUpdate(uuid, {
      $set: { payment_verified: true },
      $unset: { OTP: '' }
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'OTP verified successfully' })
    };
  } catch (err) {
    console.error('OTP Verification Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message })
    };
  } finally {
    await disconnect();
  }
}
