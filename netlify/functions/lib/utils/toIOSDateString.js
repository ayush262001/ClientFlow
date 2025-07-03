// netlify/utils/toISODateString.js

/**
 * Converts a timestamp (like Date.now()) to ISO 8601 format (UTC)
 * @param {number} timestamp - Optional, defaults to current time
 * @returns {string} ISO string like '2025-06-30T09:34:00.000Z'
 */
const toISODateString = (timestamp = Date.now()) => {
    return new Date(timestamp).toISOString();
  };
  
  export default toISODateString;
  