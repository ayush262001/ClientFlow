// netlify/functions/addMilestone.js

import { connect, disconnect } from './lib/db';
import Country from '../../model/projects.js';

import jwtVerify from './lib/middleware/jwtVerify';

const rawhandler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { countryId, projectId } = event.queryStringParameters || {};

  if (!countryId || !projectId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required params: countryId or projectId' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const { name, amount, status, payment_done } = body;

  if (!name || !amount || typeof status !== 'boolean') {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing required milestone fields: name, amount, status',
      }),
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

    const newMilestone = {
      name,
      amount,
      status,
      payment_done: payment_done || false,
      date: new Date(),
    };

    project.milestones.push(newMilestone);
    await countryDoc.save();
    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '✅ Milestone added successfully.',
        updatedMilestones: project.milestones,
      }),
    };
  } catch (err) {
    console.error('❌ Error in addMilestone:', err);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while adding milestone.' }),
    };
  }
};


export const handler = jwtVerify(rawhandler);