// netlify/utils/jwtGenerate.js

import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token with user claims
 * @param {Object} user - User object with at least email and role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      role: user.role, // Add other custom claims here if needed
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

export default generateToken;
