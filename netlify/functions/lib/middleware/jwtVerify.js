// netlify/functions/lib/middleware/jwtVerify.js
import jwt from 'jsonwebtoken';
import generateAccessToken from '../utils/jwtGenerate.js';

const jwtVerify = (handler) => {
  return async (event, context) => {
    const authHeader = event.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      console.log('⛔ No token found in Authorization header');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      event.user = decoded; // Attach user data if needed
      console.log('✅ Token verified successfully');
      return await handler(event, context);
    } catch (err) {
      console.log('⚠️ Token error:', err.name);

      if (err.name === 'TokenExpiredError') {
        try {
          const expiredPayload = jwt.decode(token);
          const newToken = generateAccessToken({
            _id: expiredPayload.id,
            email: expiredPayload.email,
            role: expiredPayload.role
          });

          const updatedEvent = {
            ...event,
            headers: {
              ...event.headers,
              'x-access-token': newToken
            },
            user: jwt.verify(newToken, process.env.JWT_SECRET)
          };

          console.log('🔁 Token refreshed, continuing with updated token');
          return await handler(updatedEvent, context);
        } catch (regenErr) {
          console.log('❌ Token regeneration failed:', regenErr.message);
          return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Token expired. Regeneration failed.' })
          };
        }
      }

      console.log('❌ Invalid token');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
  };
};

export default jwtVerify;
