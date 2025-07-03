// netlify/functions/deleteMultipleMilestones.js

import { connect, disconnect } from './lib/db.js';
import Country from '../../model/projects.js';

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
      body: JSON.stringify({ error: 'Missing countryId or projectId in query params.' }),
    };
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' }),
    };
  }

  const { indices } = parsedBody;

  if (!Array.isArray(indices) || indices.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Milestone indices must be a non-empty array.' }),
    };
  }

  try {
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

    project.milestones = project.milestones.filter((_, index) => !indices.includes(index));

    await countryDoc.save();
    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Selected milestones deleted successfully.',
        updatedMilestones: project.milestones,
      }),
    };
  } catch (err) {
    console.error('❌ Error in deleteMultipleMilestones:', err);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while deleting milestones.' }),
    };
  }
};

export const handler = jwtVerify(rawhandler);