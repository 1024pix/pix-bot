const ScalingoClient = require('../../common/services/scalingo-client');
const gitHubService = require('../../common/services/github');
const fs = require('fs');

const repositoryToScalingoAppsReview = {
  'pix-bot': ['pix-bot-review'],
  'pix-db-replication': ['pix-datawarehouse-integration'],
  'pix-db-stats': ['pix-db-stats-review'],
  'pix-editor': ['pix-lcms-review'],
  'pix-site': ['pix-site-review', 'pix-pro-review'],
  'pix-tutos': ['pix-tutos-review'],
  'pix-ui': ['pix-ui-review'],
  pix: ['pix-front-review', 'pix-api-review'],
};

function getMessageTemplate(repositoryName) {
  const repositoriesWithSpecificMessage = ['pix-db-replication', 'pix-editor', 'pix-site', 'pix'];
  let relativeFileName;
  if (repositoriesWithSpecificMessage.includes(repositoryName)) {
    relativeFileName = `${repositoryName}.md`;
  } else {
    relativeFileName = 'default.md';
  }
  const absoluteFileName = `${__dirname}/../templates/pull-request-messages/${relativeFileName}`;
  const messageTemplate = fs.readFileSync(absoluteFileName, 'utf8');
  return messageTemplate;
}

function getMessage(repositoryName, pullRequestId, messageTemplate) {
  const shortenedRepositoryName = repositoryName.replace('pix-', '');
  const scalingoApplicationName = `${repositoryName}-review-pr${pullRequestId}`;
  const scalingoDashboardUrl = `https://dashboard.scalingo.com/apps/osc-fr1/${scalingoApplicationName}/environment`;
  const webApplicationUrl = `https://${shortenedRepositoryName}-pr202.review.pix.fr`;
  const message = messageTemplate
    .replaceAll('{{pullRequestId}}', pullRequestId)
    .replaceAll('{{webApplicationUrl}}', webApplicationUrl)
    .replaceAll('{{scalingoDashboardUrl}}', scalingoDashboardUrl);
  return message;
}

const addMessageToPullRequest = async ({ repositoryName, pullRequestId }) => {
  const messageTemplate = getMessageTemplate(repositoryName);
  const message = getMessage(repositoryName, pullRequestId, messageTemplate);

  await gitHubService.commentPullRequest({
    repositoryName,
    pullRequestId,
    comment: message,
  });
};

module.exports = {
  addMessageToPullRequest,
  async processWebhook(request) {
    const eventName = request.headers['x-github-event'];
    if (eventName === 'pull_request') {
      const payload = request.payload;
      const repository = payload.pull_request.head.repo.name;
      const prId = payload.number;
      const reviewApps = repositoryToScalingoAppsReview[repository];
      const labelsList = payload.pull_request.labels;
      if (payload.pull_request.head.repo.fork) {
        return 'No RA for a fork';
      }
      if (payload.action !== 'opened') {
        return `Ignoring ${payload.action} action`;
      }
      if (!reviewApps) {
        return 'No RA configured for this repository';
      }
      if (labelsList.some((label) => label.name == 'no-review-app')) {
        return 'RA disabled for this PR';
      }
      try {
        const client = await ScalingoClient.getInstance('reviewApps');
        for (const appName of reviewApps) {
          await client.deployReviewApp(appName, prId);
        }
        await addMessageToPullRequest({ repositoryName: repository, pullRequestId: prId });
        return `Created RA on app ${reviewApps.join(', ')} with pr ${prId}`;
      } catch (error) {
        throw new Error(`Scalingo APIError: ${error.message}`);
      }
    } else {
      return `Ignoring ${eventName} event`;
    }
  },
};
