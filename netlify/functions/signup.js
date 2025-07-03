import { connect, disconnect } from './lib/db';
import userModel from '../../model/user.js';
import generateToken from './lib/utils/jwtGenerate.js';
import generateOTP from './lib/utils/generateOtp.js';
import companyEmailSender from './lib/utils/companyEmailSender.js';
import otpTemplate from './lib/emailTemplate/otpTemplate';
import uploadToS3 from './lib/utils/s3Uploader.js';

import busboy from 'busboy';
import { PassThrough } from 'stream';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  const bb = busboy({ headers: event.headers });
  const fields = {};
  let fileBuffer = null;
  let fileInfo = null;

  return new Promise((resolve, reject) => {
    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      fileInfo = { fieldname, filename, encoding, mimetype };
      const chunks = [];

      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });

    bb.on('finish', async () => {
      try {
        await connect();

        const {
          name,
          email,
          cardHolderName,
          cardNumber,
          cvv,
          expiryDate,
          next_payment_date,
          freelancer
        } = fields;

        if (!fileBuffer || !fileInfo) {
          return resolve({
            statusCode: 400,
            body: JSON.stringify({ message: 'Profile picture is required' })
          });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
          return resolve({
            statusCode: 400,
            body: JSON.stringify({ message: 'Email already registered' })
          });
        }

        const { otp, expiresAt } = generateOTP();
        const token = generateToken({ email, role: freelancer });

        // Upload to S3
        const s3Result = await uploadToS3({
          buffer: fileBuffer,
          filename: fileInfo.filename,
          mimetype: fileInfo.mimetype
        });

        const profile_pic_id = s3Result.Key || s3Result.Location;

        const newUser = new userModel({
          name,
          email,
          profile_pic_id,
          token,
          OTP: { otp, expiresAt },
          next_payment_date,
          freelancer,
          payment_verified: false,
          paymentData: {
            cardHolderName,
            cardNumber,
            cvv,
            expiryDate
          }
        });

        const userData = await newUser.save();

        await companyEmailSender({
          to: email,
          subject: 'Your OTP for Signup Verification',
          html: otpTemplate({ username: name, otp })
        });

        await disconnect();

        return resolve({
          statusCode: 201,
          body: JSON.stringify({
            message: 'User registered successfully. OTP sent to email.',
            userId: newUser._id,
            token,
            userData
          })
        });
      } catch (err) {
        console.error('❌ Signup Error:', err);
        await disconnect();
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ message: 'Server Error', error: err.message })
        });
      }
    });

    const stream = new PassThrough();
    stream.end(Buffer.from(event.body, 'base64'));
    stream.pipe(bb);
  });
}
