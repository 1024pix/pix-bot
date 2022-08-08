const deploySitesController = require('../controllers/deploy-sites');

module.exports = [
  {
    method: 'POST',
    path: '/deploy-sites',
    handler: deploySitesController.deploySites,
  },
];
