const scalingoController = require('../controllers/scalingo');

module.exports = [
  {
    method: 'POST',
    path: '/scalingo/webhook/deployment',
    handler: scalingoController.deploymentWebhook
  }
];
