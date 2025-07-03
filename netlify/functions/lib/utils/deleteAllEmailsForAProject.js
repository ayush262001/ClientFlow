// utils/email/deleteEmailHistoryByProject.js

import emailHistory from '../../Models/EmailHistory/emailHistory.js';
import Country from '../../Models/Project/projects.js';
import { connect, disconnect } from '../../config/Db.js';

/**
 * Deletes all email history entries for a given country and project.
 * @param {string} countryId
 * @param {string} projectId
 * @returns {Promise<boolean>} - true if deleted, false if not
 */
export const deleteEmailHistoryByProject = async (countryId, projectId) => {
  try {
    await connect();

    const country = await Country.findById(countryId);
    if (!country) {
      await disconnect();
      return false;
    }

    const project = country.project.id(projectId);
    if (!project) {
      await disconnect();
      return false;
    }

    const deleted = await emailHistory.findOneAndDelete({ project_id: projectId });

    await disconnect();

    return !!deleted;
  } catch (err) {
    console.error('❌ Error deleting email history:', err);
    await disconnect();
    return false;
  }
};
