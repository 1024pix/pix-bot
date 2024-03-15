import * as cdnServices from '../services/cdn';
import config from '../../config';
import * as Boom from '@hapi/boom';

const applications = {
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

export default applications;
