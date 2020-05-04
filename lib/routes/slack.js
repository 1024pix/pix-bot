const { verifySignatureAndParseBody } = require('../services/slack/security');
const slackbotController = require('../controllers/slack');

const slackConfig = {
  payload: {
    allow: 'application/x-www-form-urlencoded',
    parse: false
  },
  pre: [
    { method: verifySignatureAndParseBody, assign: 'payload' }
  ]
};

module.exports = [
  {
    method: 'POST',
    path: '/slack/commands/create-and-deploy-pix-site-release',
    handler: slackbotController.createAndDeployPixSiteRelease,
    config: slackConfig
  },
  {
    method: 'POST',
    path: '/slack/interactive-endpoint',
    handler: slackbotController.interactiveEndpoint,
    config: slackConfig
  },
  {
    method: 'POST',
    path: '/slack/pull-requests',
    handler: slackbotController.getPullRequests,
    config: slackConfig
  }
];
