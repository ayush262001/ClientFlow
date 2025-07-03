// netlify/functions/deleteProject.js

import { connect, disconnect } from './lib/db.js';
import Country from '../../model/projects.js';
import s3Deleter from './lib/utils/s3Deleter.js';
import { deleteEmailHistoryByProject } from './lib/utils/deleteAllEmailsForAProject.js';

import jwtVerify from './lib/middleware/jwtVerify.js';

const rawhandler = async (event) => {
  if (event.httpMethod !== 'DELETE') {
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

  try {
    await connect();

    const countryDoc = await Country.findById(countryId);
    if (!countryDoc) {
      await disconnect();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '❌ Country not found.' }),
      };
    }

    const project = countryDoc.project.id(projectId);
    if (!project) {
      await disconnect();
      return {
        statusCode: 404,
        body: JSON.stringify({ error: '❌ Project not found in the specified country.' }),
      };
    }

    // STEP 1: Delete all S3 files
    if (project.document_shared?.length > 0) {
      for (const doc of project.document_shared) {
        try {
          const key = doc.key || doc.url.split('/').pop(); // fallback if key isn't stored
          await s3Deleter(key);
        } catch (err) {
          console.error(`⚠️ Failed to delete S3 file: ${doc.key || doc.url}`, err);
        }
      }
    }

    // STEP 2: Remove project from MongoDB
    countryDoc.project = countryDoc.project.filter(p => p._id.toString() !== projectId);
    await countryDoc.save();

    // STEP 3: Remove email history
    const deletedEmailHistory = await deleteEmailHistoryByProject(countryId, projectId);

    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Project and associated data deleted successfully.',
        emailHistoryDeleted: deletedEmailHistory
      }),
    };

  } catch (err) {
    console.error('❌ Error in deleteProject:', err);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while deleting project.' }),
    };
  }
};


export const handler = jwtVerify(rawhandler);