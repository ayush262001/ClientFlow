// netlify/functions/editMilestone.js

import { connect, disconnect } from './lib/db.js';
import Country from '../../model/projects.js';

import jwtVerify from './lib/middleware/jwtVerify.js';

const rawhandler = async (event) => {
  if (event.httpMethod !== 'PUT') {
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

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body.' }),
    };
  }

  const { milestoneIndex, updatedMilestone } = parsedBody;

  if (milestoneIndex === undefined || !updatedMilestone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing milestoneIndex or updatedMilestone in request body.' }),
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

    if (milestoneIndex < 0 || milestoneIndex >= project.milestones.length) {
      await disconnect();
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid milestone index.' }),
      };
    }

    const current = project.milestones[milestoneIndex];

    project.milestones[milestoneIndex] = {
      ...current.toObject(),
      ...updatedMilestone,
      date: updatedMilestone.date ? new Date(updatedMilestone.date) : current.date,
    };

    await countryDoc.save();
    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Milestone updated successfully.',
        project,
      }),
    };
  } catch (error) {
    console.error('❌ Error in editMilestone:', error);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while updating milestone.' }),
    };
  }
};

export const handler = jwtVerify(rawhandler)
