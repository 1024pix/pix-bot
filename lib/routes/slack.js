const { verifySlackRequest } = require('../pre-handlers/verify-slack-request');
const slackbotController = require('../controllers/slack');

module.exports = [
  {
    method: 'POST',
    path: '/slack/commands/deploy-release',
    handler: slackbotController.deployRelease,
    config: {
      payload: {
        allow: 'application/x-www-form-urlencoded',
        parse: false
      },
      pre: [
        { method: verifySlackRequest, assign: 'payload' }
      ]
    }
  },
  {
    method: 'POST',
    path: '/slack/interactive-endpoint',
    handler: slackbotController.interactiveEndpoint,
  }
];
