// netlify/functions/getEmailLogs.js

import emailHistory from '../../model/emailHistory.js';
import { connect, disconnect } from './lib/db.js';

import jwtVerify from './lib/middleware/jwtVerify.js';

const rawhandler = async (event) => {
  const project_id = event.queryStringParameters?.project_id;

  if (!project_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing project_id in parameters.' }),
    };
  }

  try {
    await connect();

    const historyDoc = await emailHistory.findOne({ project_id });

    await disconnect();

    if (!historyDoc) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No email history found for this project.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        project_id,
        email_count: historyDoc.emails.length,
        emails: historyDoc.emails,
      }),
    };
  } catch (err) {
    console.error('❌ Error fetching email history:', err);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while fetching email history.' }),
    };
  }
};

export const handler = jwtVerify(rawhandler);