const releasesController = require('../controllers/releases');

module.exports = [
  {
    method: 'POST',
    path: '/pix-site/releases',
    handler: releasesController.createAndDeployPixSiteRelease
  }
];
