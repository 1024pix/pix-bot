const releasesController = require('../controllers/releases');

module.exports = [{
  method: 'POST',
  path: '/releases',
  handler: releasesController.deployRelease
}];
