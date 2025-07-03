// netlify/utils/generateOtp.js

/**
 * Generates a 6-digit OTP and an expiry time (2 mins from now)
 * @returns {{ otp: string, expiresAt: number }}
 */
const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes from now
    return { otp, expiresAt };
  };
  
  export default generateOtp;
  