const { deploy, createAndDeployPixSite } = require('../services/releases');
const config = require('../config');

module.exports = {

  async deployRelease(request, h) {
    if (!request.payload || !request.payload.authorizationToken) {
      return h.response().code(401);
    }

    if (request.payload.authorizationToken !== config.openApi.authorizationToken) {
      return h.response().code(403);
    }

    const releaseTag = request.payload.release_tag;

    return deploy(releaseTag);
  },

  async createAndDeployPixSiteRelease(request, h) {
    if (!request.payload || !request.payload.authorizationToken) {
      return h.response().code(401);
    }

    if (request.payload.authorizationToken !== config.openApi.authorizationToken) {
      return h.response().code(403);
    }

    const releaseType = request.payload.release_type;

    return createAndDeployPixSite(releaseType);
  },

};
