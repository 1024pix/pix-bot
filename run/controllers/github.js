import ScalingoClient from '../../common/services/scalingo-client.js';
import { config } from '../../config.js';

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
    return 'No Scalingo app configured for this repository';
  }

  return deployFromArchive(appNames, tag, repository, injectedScalingoClient);
}

async function deployFromArchive(appNames, tag, repository, scalingoClient) {
  return Promise.all(
    appNames.map(async (appName) => {
      const appNameFragment = appName.split('-');
      const instance = appNameFragment[appNameFragment.length - 1];
      const client = await scalingoClient.getInstance(instance);
      return client.deployFromArchive(appName, tag, repository, { withEnvSuffix: false });
    }),
  );
}

export { processWebhook, releaseWebhook };
