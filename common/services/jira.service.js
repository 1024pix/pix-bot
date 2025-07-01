import { config } from '../../config.js';
import { logger } from './logger.js';

const createJiraFetcher = (host, email, apiToken) => {
  const baseUrl = `${host}/rest/api/3`;
  const token = btoa(`${email}:${apiToken}`);
  return ({ path, method, body }) => {
    return fetch(`${baseUrl}${path}`, {
      headers: {
        authorization: `Basic ${token}`,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      method,
      body,
    });
  };
};

async function getVersionList() {
  try {
    const jiraFetcher = createJiraFetcher(config.jira.host, config.jira.userEmail, config.jira.apiToken);
    const request = await jiraFetcher({ path: `/project/${config.jira.projectId}/versions`, method: 'GET' });
    if (request.ok) {
      const data = await request.json();
      return data;
    }
  } catch (error) {
    logger.error({
      event: 'Jira release',
      message: 'An error occurred',
      job: 'jira service',
      stack: 'get version list',
      data: error,
    });
    throw error;
  }
}

async function finalize(versionId) {
  try {
    const jiraFetcher = createJiraFetcher(config.jira.host, config.jira.userEmail, config.jira.apiToken);
    const request = await jiraFetcher({
      path: `/version/${versionId}`,
      method: 'PUT',
      body: JSON.stringify({
        released: true,
        releaseDate: new Date(),
      }),
    });
    if (request.ok) {
      return true;
    }
  } catch (error) {
    logger.error({
      event: 'Jira release',
      message: 'An error occurred',
      job: 'jira service',
      stack: 'finalize version',
      data: error,
    });
    throw error;
  }
}

export { getVersionList, finalize };
