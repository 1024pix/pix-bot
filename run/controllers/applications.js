import Boom from '@hapi/boom';

import { config } from '../../config.js';
import * as cdnServices from '../services/cdn.js';

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
