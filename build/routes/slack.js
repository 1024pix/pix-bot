const { slackConfig } = require('../../common/config');
const slackbotController = require('../controllers/slack');

module.exports = [
  {
    method: 'POST',
    path: '/build/slack/interactive-endpoint',
    handler: slackbotController.interactiveEndpoint,
    config: slackConfig
  },
];
