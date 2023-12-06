const scalingoController = require('../../build/controllers/scalingo');

module.exports = [
  {
    method: 'POST',
    path: '/build/scalingo/deploy-endpoint',
    handler: scalingoController.deployEndpoint,
  },
  {
    method: 'POST',
    path: '/build/scalingo/restart-review-app',
    handler: scalingoController.restartReviewApp,
  },
];
