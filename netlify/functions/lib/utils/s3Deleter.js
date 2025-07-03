// netlify/utils/s3Deleter.js

import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

/**
 * Deletes a file from S3 using the key
 * @param {string} key - The S3 object key to delete
 * @returns {Promise<{ success: boolean, result?: any, error?: any }>}
 */
const s3Deleter = async (key) => {
  if (!BUCKET_NAME) {
    throw new Error('❌ Missing S3 bucket name in environment variables.');
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  try {
    const result = await s3.deleteObject(params).promise();
    return { success: true, result };
  } catch (error) {
    console.error('❌ Error deleting from S3:', error);
    return { success: false, error };
  }
};

export default s3Deleter;
