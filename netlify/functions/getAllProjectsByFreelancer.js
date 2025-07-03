// netlify/functions/getAllProjectsByFreelancer.js

import { connect, disconnect } from './lib/db.js';
import Country from '../../model/projects.js';

import jwtVerify from './lib/middleware/jwtVerify.js';

const rawhandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { freelancer_id } = event.queryStringParameters || {};

  if (!freelancer_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'freelancer_id is required' }),
    };
  }

  try {
    await connect();

    // Fetch countries where the freelancer has projects
    const countries = await Country.find({ freelancer_id });

    const result = countries.map((country) => ({
      _id: country._id,
      country: country.country,
      projects: country.project.map((p) => ({
        _id: p._id,
        name: p.name,
      })),
    }));

    await disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify({ countries: result }),
    };
  } catch (error) {
    console.error('❌ Error in getAllProjectsByFreelancer:', error);
    await disconnect();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error while fetching projects.' }),
    };
  }
};

export const handler = jwtVerify(rawhandler);