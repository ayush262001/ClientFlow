// netlify/functions/addDocument.js

import { connect, disconnect } from '../../config/Db.js';
import Country from '../../Models/Project/projects.js';
import s3Uploader from './lib/utils/s3Uploader.js';
import AWS from 'aws-sdk';
import Busboy from 'busboy';
import jwtVerify from './lib/middleware/jwtVerify.js';

const rawhandler = async (event, context) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { countryId, projectId } = event.queryStringParameters || {};

  if (!countryId || !projectId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing countryId or projectId in query parameters.' }),
    };
  }

  let files = [];

  try {
    // Parse multipart form data using Busboy
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'],
      },
    });

    const filePromises = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const fileChunks = [];

      file.on('data', (data) => fileChunks.push(data));
      file.on('end', () => {
        const fileBuffer = Buffer.concat(fileChunks);
        const fakeFile = {
          originalname: filename,
          buffer: fileBuffer,
          mimetype,
        };
        filePromises.push(s3Uploader(fakeFile));
      });
    });

    await new Promise((resolve, reject) => {
      busboy.on('finish', resolve);
      busboy.on('error', reject);
      busboy.end(Buffer.from(event.body, 'base64'));
    });

    const s3Uploads = await Promise.all(filePromises);

    // MongoDB operations
    await connect();

    const countryDoc = await Country.findById(countryId);
    if (!countryDoc) {
      await disconnect();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Country not found.' }),
      };
    }

    const project = countryDoc.project.id(projectId);
    if (!project) {
      await disconnect();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Project not found.' }),
      };
    }

    const uploadedDocs = s3Uploads.map((upload, index) => ({
      url: upload.Location,
      name: s3Uploads[index].originalname || 'Document',
    }));

    project.document_shared.push(...uploadedDocs);
    await countryDoc.save();
    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Documents added successfully.',
        updatedDocuments: project.document_shared,
      }),
    };
  } catch (err) {
    console.error('❌ Error uploading documents:', err);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while uploading documents.' }),
    };
  }
};

export const handler = jwtVerify(rawhandler);