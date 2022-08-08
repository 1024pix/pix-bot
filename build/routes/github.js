const { githubConfig } = require('../../common/config');
const githubController = require('../../build/controllers/github');

module.exports = [
  {
    method: 'POST',
    path: '/github/webhook',
    handler: githubController.processWebhook,
    config: githubConfig,
  },
];
