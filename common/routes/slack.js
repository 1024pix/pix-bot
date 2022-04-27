const { slackConfig } = require('../config');
const slackbotController = require('../controllers/slack');

module.exports = [
  {
    method: 'POST',
    path: '/slack/interactive-endpoint',
    handler: slackbotController.interactiveEndpoint,
    config: slackConfig
  },
];
