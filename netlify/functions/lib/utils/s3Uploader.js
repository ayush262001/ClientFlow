// netlify/utils/s3Uploader.js

import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Uploads a file to S3
 * @param {Object} file - File object with buffer, originalname, and mimetype
 * @returns {Promise<Object>} S3 response with Location, Key, etc.
 */
const s3Uploader = async (file) => {
  if (!BUCKET_NAME) {
    throw new Error('❌ Missing S3 bucket name in environment variables.');
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};

export default s3Uploader;
