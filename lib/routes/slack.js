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
        output: 'data',
        parse: false
      }
    }
  },
];
