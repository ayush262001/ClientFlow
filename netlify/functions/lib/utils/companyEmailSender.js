// netlify/utils/companyEmailSender.js

import nodemailer from 'nodemailer';

/**
 * Send an email using SMTP (Gmail or other)
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Optional plain text version
 * @returns {Promise<{ success: boolean, info?: any, error?: any }>}
 */
const companyEmailSender = async ({ to, subject, html, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Change this if using a different provider
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Company Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || '',
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, info };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

export default companyEmailSender;
