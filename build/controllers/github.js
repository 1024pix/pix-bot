const ScalingoClient = require('../../common/services/scalingo-client');

const repositoryToScalingoAppsReview = {
  'pix-bot': ['pix-bot-review'],
  'pix-db-replication': ['pix-datawarehouse-integration'],
  'pix-db-stats': ['pix-db-stats-review'],
  'pix-editor': ['pix-lcms-review'],
  'pix-site': ['pix-site-review', 'pix-pro-review'],
  'pix-ui': ['pix-ui-review'],
  pix: ['pix-front-review', 'pix-api-review'],
};

module.exports = {
  async processWebhook(request) {
    const eventName = request.headers['x-github-event'];
    if (eventName === 'pull_request') {
      const payload = request.payload;
      const repository = payload.pull_request.head.repo.name;
      const prId = payload.number;
      const reviewApps = repositoryToScalingoAppsReview[repository];
      if (payload.pull_request.head.repo.fork) {
        return 'No RA for a fork';
      }
      if (payload.action !== 'opened') {
        return `Ignoring ${payload.action} action`;
      }
      if (!reviewApps) {
        return 'No RA configured for this repository';
      }
      const client = await ScalingoClient.getInstance('reviewApps');
      for (const appName of reviewApps) {
        await client.deployReviewApp(appName, prId);
      }
      return `Created RA on app ${reviewApps.join(', ')} with pr ${prId}`;
    } else {
      return `Ignoring ${eventName} event`;
    }
  }
};
