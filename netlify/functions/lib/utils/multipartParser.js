// netlify/functions/lib/utils/multipartParser.js

import multipart from 'lambda-multipart-parser';

/**
 * Parses a multipart/form-data request in Netlify function format
 * @param {Object} event - Netlify function event object
 * @returns {Promise<{ files: Array, fields: Object }>}
 */
export const multipartParser = async (event) => {
  return multipart.parse(event);
};
