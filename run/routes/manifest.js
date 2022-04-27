const manifestController = require('../controllers/manifest');

module.exports = [
  {
    method: 'GET',
    path: '/run/manifest',
    handler: manifestController.get,
  }
];

