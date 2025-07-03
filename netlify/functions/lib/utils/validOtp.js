// netlify/utils/validOtp.js

/**
 * Validates whether the entered OTP matches the stored one and is not expired
 * @param {string|number} enteredOtp - OTP entered by the user
 * @param {string|number} storedOtp - OTP saved in DB
 * @param {number|string|Date} expiresAt - Expiry time
 * @returns {boolean} true if valid and not expired, false otherwise
 */
const validOtp = (enteredOtp, storedOtp, expiresAt) => {
    const now = Date.now();
    return (
      enteredOtp === storedOtp.toString() &&
      now < new Date(expiresAt).getTime()
    );
  };
  
  export default validOtp;
  