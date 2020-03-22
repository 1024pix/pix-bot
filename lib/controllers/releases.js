const { deploy } = require('../services/releases');
const config = require('../config');

module.exports = {

  async deployRelease(request, h) {
    if (!request.payload || !request.payload.authorizationToken) {
      return h.response().code(401);
    }

    if (request.payload.authorizationToken !== config.openApi.authorizationToken) {
      return h.response().code(403);
    }

    const version = request.payload.version;

    return deploy(version);
  },

};
