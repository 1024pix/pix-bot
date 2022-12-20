const ScalingoClient = require('../../common/services/scalingo-client');
const gitHubService = require('../../common/services/github');

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

const addApplicationLinkToPullRequest = async ({ repositoryName, pullRequestId }) => {
  if (repositoryName === 'pix') {
    const applicationLinks = [
      `- App (.fr): https://app-pr${pullRequestId}.review.pix.fr`,
      `- App (.org): https://app-pr${pullRequestId}.review.pix.org`,
      `- Orga: https://orga-pr${pullRequestId}.review.pix.fr`,
      `- Certif: https://certif-pr${pullRequestId}.review.pix.fr`,
      `- Admin:https://admin-pr${pullRequestId}.review.pix.fr`,
      `- API: https://api-pr${pullRequestId}.review.pix.fr/api/`,
    ];
    const comment = `I'm deploying this PR to these urls: \n ${applicationLinks.join('\n')} \nPlease check it out!`;

    await gitHubService.commentPullRequest({
      repositoryName,
      pullRequestId,
      comment,
    });
  }
};

module.exports = {
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
        return `Created RA on app ${reviewApps.join(', ')} with pr ${prId}`;
      } catch (error) {
        throw new Error(`Scalingo APIError: ${error.message}`);
      }
    } else {
      return `Ignoring ${eventName} event`;
    }
  },
  addApplicationLinkToPullRequest,
};
