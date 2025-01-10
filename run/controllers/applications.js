import Boom from '@hapi/boom';

import { config } from '../../config.js';
import cdnService from '../services/cdn.js';

const applications = {
  async invalidateCdnCache(request) {
    if (request.query.apiKey !== config.openApi.authorizationToken) {
      throw Boom.unauthorized('Token is missing or is incorrect');
    }

    try {
      return await cdnService.invalidateCdnCache(request.params.name);
    } catch (error) {
      if (error instanceof cdnService.NamespaceNotFoundError) {
        return Boom.badRequest();
      }
      return error;
    }
  },
};

export default applications;
