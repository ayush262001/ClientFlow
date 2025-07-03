import jwt from 'jsonwebtoken';

// Required if using environment variables in Netlify functions locally
import 'dotenv/config';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ valid: false, message: 'Method Not Allowed' })
    };
  }

  const { uuid } = event.queryStringParameters || {};
  const authHeader = event.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ valid: false, message: 'No token provided' })
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.id && decoded.id !== uuid) {
      return {
        statusCode: 403,
        body: JSON.stringify({ valid: false, message: 'UUID mismatch' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ valid: false, message: err.message })
    };
  }
}
