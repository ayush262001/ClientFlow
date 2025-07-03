// netlify/utils/dynamicSMTPMailer.js

import nodemailer from 'nodemailer';

/**
 * Dynamically send an email using custom sender credentials
 * 
 * @param {Object} params
 * @param {string} params.from - Sender email address
 * @param {string} params.email_pass - Sender's email password (app-specific password)
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {string} [params.text] - Optional plain text version
 * @param {Array} [params.attachments] - Optional attachments (filename, content)
 * 
 * @returns {Promise<{ success: boolean, info?: any, error?: any }>}
 */
const dynamicSMTPMailer = async ({
  from,
  email_pass,
  to,
  subject,
  html,
  text = '',
  attachments = []
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: from,
        pass: email_pass,
      },
    });

    const mailOptions = {
      from,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error('❌ SMTP Send Error:', error);
    return { success: false, error };
  }
};

export default dynamicSMTPMailer;
