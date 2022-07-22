const scalingoController = require('../../build/controllers/scalingo');

module.exports = [
  {
    method: 'POST',
    path: '/build/scalingo/deploy-endpoint',
    handler: scalingoController.deployEndpoint,
  },
];
