const { slackConfig } = require('../../common/config');
const googleSheet = require('../../build/services/google-sheet');
const slackbotController = require('../../build/controllers/slack');


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
];
