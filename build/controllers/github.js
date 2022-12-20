const ScalingoClient = require('../../common/services/scalingo-client');
const gitHubService = require('../../common/services/github');
const _ = require('lodash');

const repositoryToScalingoAppsReview = {
  'pix-bot': {
    repositoryNames: ['pix-bot-review'],
    urls: [`pix-bot-review.pr{{prId}}.osc-fr1.scalingo.io.`],
  },
  'pix-db-replication': {
    repositoryNames: ['pix-datawarehouse-integration'],
    urls: [`pix-datawarehouse-integration.pr{{prId}}.osc-fr1.scalingo.io.`],
  },
  'pix-db-stats': {
    repositoryNames: ['pix-db-stats-review'],
    urls: [`pix-db-stats-review.pr{{prId}}.osc-fr1.scalingo.io.`],
  },
  'pix-editor': {
    repositoryNames: ['pix-lcms-review'],
    urls: [`pix-lcms-review.pr{{prId}}.osc-fr1.scalingo.io.`],
  },
  'pix-site': {
    repositoryNames: ['pix-site-review', 'pix-pro-review'],
    urls: [
      `Pix Site (fr): https://site-pr{{prId}}.review.pix.fr/`,
      `Pix Site (org): https://site-pr{{prId}}.review.pix.org/`,
      `Pix Pro (fr): https://pro-pr{{prId}}.review.pix.fr/`,
      `Pix Pro (org): https://pro-pr{{prId}}.review.pix.org/`,
    ],
  },
  'pix-tutos': {
    repositoryNames: ['pix-tutos-review'],
    urls: [`Pix Tutos : [tutos-pr{{prId}}.review.pix.fr](https://tutos-pr{{prId}}.review.pix.fr/)`],
  },
  'pix-ui': {
    repositoryNames: ['pix-ui-review'],
    urls: [`pix-ui-review.pr{{prId}}.osc-fr1.scalingo.io.`],
  },
  pix: {
    repositoryNames: ['pix-front-review', 'pix-api-review'],
    urls: [
      `* [App .fr](https://app-pr{{prId}}.review.pix.fr)`,
      `* [App .org](https://app-pr{{prId}}.review.pix.org)`,
      `* [Orga](https://orga-pr{{prId}}.review.pix.fr)`,
      `* [Certif](https://certif-pr{{prId}}.review.pix.fr)`,
      `* [Admin](https://admin-pr{{prId}}.review.pix.fr)`,
      `* [API](https://api-pr{{prId}}.review.pix.fr/api/)`,
    ],
  },
};

const addApplicationLinkToPullRequest = async ({ repositoryName, pullRequestId }) => {
  const repositoryTemplateLinks = repositoryToScalingoAppsReview[repositoryName].urls.join('\n');
  const repositoryLinks = repositoryTemplateLinks.replaceAll('{{prId}}', pullRequestId);
  const comment = `Une fois les applications déployées, elles seront accessibles via les liens suivants :\n${repositoryLinks}`;

  await gitHubService.commentPullRequest({
    repositoryName,
    pullRequestId,
    comment,
  });
};

module.exports = {
  async processWebhook(request) {
    const eventName = request.headers['x-github-event'];
    if (eventName === 'pull_request') {
      const payload = request.payload;
      const repository = payload.pull_request.head.repo.name;
      const prId = payload.number;
      const labelsList = payload.pull_request.labels;
      if (payload.pull_request.head.repo.fork) {
        return 'No RA for a fork';
      }
      if (payload.action !== 'opened') {
        return `Ignoring ${payload.action} action`;
      }
      if (!_.has(repositoryToScalingoAppsReview, repository)) {
        return 'No RA configured for this repository';
      }
      const reviewApps = repositoryToScalingoAppsReview[repository].repositoryNames;
      if (labelsList.some((label) => label.name == 'no-review-app')) {
        return 'RA disabled for this PR';
      }
      try {
        const client = await ScalingoClient.getInstance('reviewApps');
        for (const appName of reviewApps) {
          await client.deployReviewApp(appName, prId);
        }
        await addApplicationLinkToPullRequest({ repositoryName: repository, pullRequestId: prId });
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
