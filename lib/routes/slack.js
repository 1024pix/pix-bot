const slackbotController = require('../controllers/slack');

module.exports = [{
  method: 'POST',
  path: '/slack',
  handler: slackbotController.test
}];
