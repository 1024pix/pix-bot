const { verifySlackRequest } = require('../pre-handlers/verify-slack-request');
const slackbotController = require('../controllers/slack');

module.exports = [
  {
    method: 'POST',
    path: '/slack/test',
    handler: slackbotController.test
  }, {
    method: 'POST',
    path: '/slack/deploy-release',
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
];
