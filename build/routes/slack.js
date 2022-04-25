const { slackConfig } = require('../../common/config');
const googleSheet = require('../services/google-sheet');
const slackbotController = require('../controllers/slack');

module.exports = [
  {
    method: 'POST',
    path: '/slack/commands/accessibility-tip',
    handler: googleSheet.getA11YTip,
    config: slackConfig
  },
  {
    method: 'POST',
    path: '/slack/commands/pull-requests',
    handler: slackbotController.getPullRequests,
    config: slackConfig
  },
  {
    method: 'POST',
    path: '/slack/commands/changelog',
    handler: slackbotController.getChangelogSinceLatestRelease,
    config: slackConfig
  },
  {
    method: 'POST',
    path: '/slack/commands/create-and-deploy-pix-hotfix',
    handler: slackbotController.createAndDeployPixHotfix,
    config: slackConfig
  },
];
