/**
 * Generates an OTP HTML email template
 * @param {Object} params
 * @param {string} params.username - User's name
 * @param {string} params.otp - The OTP code to be sent
 * @returns {string} HTML string
 */
const otpTemplate = ({ username, otp }) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
        <h2 style="color: #4A90E2;">Hello ${username},</h2>
        <p style="font-size: 16px;">Your One-Time Password (OTP) is:</p>
        <div style="font-size: 28px; font-weight: bold; margin: 20px 0; background: #fff; padding: 12px 24px; display: inline-block; border: 1px dashed #4A90E2; border-radius: 6px; color: #333;">
          ${otp}
        </div>
        <p style="font-size: 14px; color: #555;">This OTP is valid for 2 minutes. Please do not share it with anyone.</p>
        <br />
        <p style="font-size: 14px; color: #777;">If you didn’t request this, you can safely ignore this email.</p>
        <p style="font-size: 14px; color: #777;">Regards,<br /><strong>Your Company Team</strong></p>
      </div>
    `;
  };
  
  export default otpTemplate;
  