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
  const appNames = repoAppMapping[request.payload.repository.name];
  const tag = request.payload.release.tag_name;

  if (!appNames) {
    return 'No Scalingo app configured for this repository';
  }

  return deployTagUsingSCM(appNames, tag, injectedScalingoClient);
}

async function deployTagUsingSCM(appNames, tag, scalingoClient) {
  const client = await scalingoClient.getInstance('production');
  return Promise.all(
    appNames.map((appName) => {
      return client.deployUsingSCM(appName, tag);
    }),
  );
}

export { processWebhook, releaseWebhook };
