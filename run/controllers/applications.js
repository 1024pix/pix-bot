const cdnServices = require('../services/cdn');
const config = require('../../config');
const Boom = require('@hapi/boom');

module.exports = {
  async invalidateCdnCache(request) {
    if (request.query.apiKey !== config.openApi.authorizationToken) {
      throw Boom.unauthorized('Token is missing or is incorrect');
    }

    try {
      return await cdnServices.invalidateCdnCache(request.params.name);
    } catch (error) {
      if (error instanceof cdnServices.NamespaceNotFoundError) {
        return Boom.badRequest();
      }
      return error;
    }
  },
};
