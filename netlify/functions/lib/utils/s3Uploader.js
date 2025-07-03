// netlify/utils/s3Uploader.js

import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Uploads a file to S3 and returns relevant metadata.
 * @param {Object} file - File object with buffer, originalname, and mimetype
 * @returns {Promise<Object>} S3 response with Location, Key, and originalname
 */
const s3Uploader = async (file) => {
  if (!BUCKET_NAME) {
    throw new Error('❌ Missing S3 bucket name in environment variables.');
  }

  const uniqueKey = `${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: uniqueKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();

  return {
    Location: uploadResult.Location,
    Key: uploadResult.Key,
    originalname: file.originalname, // ✅ Include this for reference in DB
  };
};

export default s3Uploader;
