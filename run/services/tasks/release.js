import { logger } from '../../../common/services/logger.js';
import githubService from '../../../common/services/github.js';

async function run({ repository, branch }, github = githubService) {
  logger.info({
    event: 'release',
    message: `Starting ${repository} release.`,
  });
  try {
    await github.triggerWorkflow({
      workflow: {
        id: 'release.yml',
        repositoryName: repository,
        ref: branch,
      },
    });

    logger.info({
      event: 'release',
      message: `Release workflow triggered for repository ${repository}.`,
    });
  } catch (error) {
    throw new Error(`Github APIError during release`, { cause: error });
  }
}

export { run };
