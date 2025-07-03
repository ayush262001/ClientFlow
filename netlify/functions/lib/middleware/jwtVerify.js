import jwt from 'jsonwebtoken';
import generateAccessToken from '../utils/jwtGenerate';

const jwtVerify = () => {
  return async (req, res, next) => {
    console.log('🔐 jwtVerify middleware called');

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      console.log('⛔ No token found in Authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('✅ Token received:', token.slice(0, 20), '...');

    // Step 1: Try verifying token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        console.log('✅ Token verified successfully');
        req.user = decoded;
        return next();
      }

      console.log('⚠️ Token verification error:', err.name);

      // Step 2: Handle expired token
      if (err.name === 'TokenExpiredError') {
        try {
          console.log('🔁 Token expired. Attempting to regenerate...');

          const expiredPayload = jwt.decode(token);
          console.log('📦 Decoded expired payload:', expiredPayload);

          const newToken = generateAccessToken({
            _id: expiredPayload.id,
            email: expiredPayload.email,
            role: expiredPayload.role,
          });

          res.setHeader('x-access-token', newToken);
          console.log('🔁 New token generated and sent in x-access-token header');

          req.user = jwt.verify(newToken, process.env.JWT_SECRET);
          return next();
        } catch (e) {
          console.log('❌ Token regeneration failed:', e.message);
          return res.status(401).json({ error: 'Token expired. Regeneration failed.' });
        }
      }

      console.log('❌ Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    });
  };
};

export default jwtVerify;
