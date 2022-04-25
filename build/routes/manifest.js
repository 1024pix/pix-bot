const manifestController = require('../controllers/manifest');

module.exports = [
  {
    method: 'GET',
    path: '/build/manifest',
    handler: manifestController.get,
  },
];
