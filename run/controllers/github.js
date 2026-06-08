import ScalingoClient from '../../common/services/scalingo-client.js';
import { config } from '../../config.js';
import { logger } from '../../common/services/logger.js';

async function processWebhook(request, { injectedReleaseWebhook = releaseWebhook } = {}) {
  const eventName = request.headers['x-github-event'];
  if (eventName === 'release') {
    if (request.payload.action === 'released') {
      return injectedReleaseWebhook(request);
    }
    return `Ignoring ${request.payload.action} action`;
  } else {
    return `Ignoring ${eventName} event`;
  }
}

async function releaseWebhook(request, repoAppMapping = config.repoAppNames, injectedScalingoClient = ScalingoClient) {
  const repository = request.payload.repository.name;
  const appNames = repoAppMapping[repository];
  const tag = request.payload.release.tag_name;

  if (!appNames) {
      logger.info({
        event: 'release',
        message: `Github repository ${repository} has been released, but any deployement is configured . To enable deployment, please configure repo in REPO_APP_NAMES_MAPPING env var.`,
      });
    return 'No Scalingo app configured for this repository';
  }

  return deployFromArchive(appNames, tag, repository, injectedScalingoClient);
}

async function deployFromArchive(appNames, tag, repository, scalingoClient) {
  logger.info({
    event: 'release',
    message: `Github repository ${repository} has been released. Starting ${appNames} deployment of ${tag}.`,
  });
  return Promise.all(
    appNames.map(async (appName) => {
      try{
        const appNameFragment = appName.split('-');
        const instance = appNameFragment[appNameFragment.length - 1];
        const client = await scalingoClient.getInstance(instance);
        return client.deployFromArchive(appName, tag, repository, { withEnvSuffix: false });
      } catch (error) {
        logger.error({
          event: 'release',
          stack: error.stack,
          message: `${appName} deployment failed : ${error.message}. Please create the github release again to reload deployment.`,        
          data: {
            repository,
            tag,
            appName,
          },
        });
      }
    }),
  );
}

export { processWebhook, releaseWebhook };
