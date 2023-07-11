const fs = require('fs');
const path = require('path');

const ScalingoClient = require('../../common/services/scalingo-client');
const gitHubService = require('../../common/services/github');
const logger = require('../../common/services/logger');
const settings = require('../../config');

const repositoryToScalingoAppsReview = {
  'pix-bot': ['pix-bot-review'],
  'pix-data': ['pix-airflow-review'],
  'pix-db-replication': ['pix-datawarehouse-integration'],
  'pix-db-stats': ['pix-db-stats-review'],
  'pix-editor': ['pix-lcms-review'],
  'pix-site': ['pix-site-review', 'pix-pro-review'],
  'pix-tutos': ['pix-tutos-review'],
  'pix-ui': ['pix-ui-review'],
  pix: ['pix-front-review', 'pix-api-review'],
  pix4pix: ['pix-4pix-front-review', 'pix-4pix-api-review'],
};

function getMessageTemplate(repositoryName) {
  const baseDir = path.join(__dirname, '..', 'templates', 'pull-request-messages');
  let relativeFileName;
  if (fs.existsSync(path.join(baseDir, `${repositoryName}.md`))) {
    relativeFileName = `${repositoryName}.md`;
  } else {
    relativeFileName = 'default.md';
  }

  const messageTemplate = fs.readFileSync(path.join(baseDir, relativeFileName), 'utf8');
  return messageTemplate;
}

function getMessage(repositoryName, pullRequestId, scalingoReviewApps, messageTemplate) {
  const scalingoDashboardUrl = `https://dashboard.scalingo.com/apps/osc-fr1/${scalingoReviewApps[0]}-pr${pullRequestId}/environment`;
  const shortenedRepositoryName = repositoryName.replace('pix-', '');
  const webApplicationUrl = `https://${shortenedRepositoryName}-pr${pullRequestId}.review.pix.fr`;
  const message = messageTemplate
    .replaceAll('{{pullRequestId}}', pullRequestId)
    .replaceAll('{{webApplicationUrl}}', webApplicationUrl)
    .replaceAll('{{scalingoDashboardUrl}}', scalingoDashboardUrl);
  return message;
}

const addMessageToPullRequest = async ({ repositoryName, pullRequestId, scalingoReviewApps }) => {
  const messageTemplate = getMessageTemplate(repositoryName);
  const message = getMessage(repositoryName, pullRequestId, scalingoReviewApps, messageTemplate);

  await gitHubService.commentPullRequest({
    repositoryName,
    pullRequestId,
    comment: message,
  });
};

async function pullRequestOpenedWebhook(request) {
  const payload = request.payload;
  const repository = payload.pull_request.head.repo.name;
  const prId = payload.number;
  const ref = payload.pull_request.head.ref;
  const reviewApps = repositoryToScalingoAppsReview[repository];

  const { shouldContinue, message } = _handleNoRACase(request);
  if (!shouldContinue) {
    return message;
  }

  try {
    const client = await ScalingoClient.getInstance('reviewApps');
    logger.info({
      event: 'review-app',
      message: `Creating RA for repo ${repository} PR ${prId}`,
    });
    for (const appName of reviewApps) {
      const { app_name: reviewAppName } = await client.deployReviewApp(appName, prId);
      await client.disableAutoDeploy(reviewAppName);
      await client.deployUsingSCM(reviewAppName, ref);
    }
    await addMessageToPullRequest({
      repositoryName: repository,
      scalingoReviewApps: reviewApps,
      pullRequestId: prId,
    });
    logger.info({
      event: 'review-app',
      message: `Created RA for repo ${repository} PR ${prId}`,
    });
    return `Created RA on app ${reviewApps.join(', ')} with pr ${prId}`;
  } catch (error) {
    throw new Error(`Scalingo APIError: ${error.message}`);
  }
}

async function pullRequestSynchronizeWebhook(request) {
  const payload = request.payload;
  const repository = payload.pull_request.head.repo.name;
  const ref = payload.pull_request.head.ref;
  const reviewApps = repositoryToScalingoAppsReview[repository];
  const prId = payload.number;

  const { shouldContinue, message } = _handleNoRACase(request);
  if (!shouldContinue) {
    return message;
  }

  try {
    const client = await ScalingoClient.getInstance('reviewApps');
    for (const appName of reviewApps) {
      const reviewAppName = `${appName}-pr${prId}`;
      await client.deployUsingSCM(reviewAppName, ref);
    }
  } catch (error) {
    throw new Error(`Scalingo APIError: ${error.message}`);
  }

  logger.info({
    event: 'review-app',
    message: `PR${prId} deployement triggered on RA for repo ${repository}`,
  });

  return `Triggered deployment of RA on app ${reviewApps.join(', ')} with pr ${prId}`;
}

function _handleNoRACase(request) {
  const payload = request.payload;
  const repositoryName = payload.pull_request.head.repo.name;
  const repositoryOwner = payload.pull_request.head.repo.owner.login;
  const reviewApps = repositoryToScalingoAppsReview[repositoryName];
  const isFork = payload.pull_request.head.repo.fork;
  const labelsList = payload.pull_request.labels;
  const state = payload.pull_request.state;

  const organization = settings.github.owner;
  if (isFork && repositoryOwner !== organization) {
    return { message: 'No RA for a fork not owned by the organization', shouldContinue: false };
  }
  if (!reviewApps) {
    return { message: 'No RA configured for this repository', shouldContinue: false };
  }
  if (labelsList.some((label) => label.name == 'no-review-app')) {
    return { message: 'RA disabled for this PR', shouldContinue: false };
  }
  if (state !== 'open') {
    return { message: 'No RA for closed PR', shouldContinue: false };
  }

  return { shouldContinue: true };
}

module.exports = {
  getMessageTemplate,
  getMessage,
  addMessageToPullRequest,
  async processWebhook(request) {
    const eventName = request.headers['x-github-event'];
    if (eventName === 'pull_request') {
      switch (request.payload.action) {
        case 'opened':
          return pullRequestOpenedWebhook(request);
        case 'reopened':
          return pullRequestOpenedWebhook(request);
        case 'synchronize':
          return pullRequestSynchronizeWebhook(request);
      }
      return `Ignoring ${request.payload.action} action`;
    } else {
      return `Ignoring ${eventName} event`;
    }
  },
};
