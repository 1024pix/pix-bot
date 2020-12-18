const applicationController = require('../controllers/applications');

module.exports = [
  {
    method: 'POST',
    path: '/applications/{name}/cdn-cache-invalidations',
    handler: applicationController.invalidateCdnCache,
  }
];

