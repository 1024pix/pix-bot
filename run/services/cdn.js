import axios from 'axios';
import axiosRetry from 'axios-retry';

import { logger } from '../../common/services/logger.js';
import { config } from '../../config.js';

const CDN_URL = 'https://my.imperva.com/api/prov/v2';

function _getSiteId(application) {
  const siteId = JSON.parse(config.cdn.siteIds)[application];
  if (!siteId) {
    throw new Error(`Cache invalidation not implemented for ${application}.`);
  }
  return siteId;
}

async function invalidateCdnCache(application) {
  const siteId = _getSiteId(application);
  const urlForInvalidate = `${CDN_URL}/sites/${siteId}/cache`;

  axiosRetry(axios, {
    retries: config.cdn.CDNInvalidationRetryCount,
    retryDelay: (retryCount) => {
      logger.info({
        event: 'cdn',
        message: `Cache invalidation retry for application ${application}: ${retryCount}`,
      });

      return retryCount * config.cdn.CDNInvalidationRetryDelay;
    },
    retryCondition: (error) => {
      return error.response.status === 500;
    },
  });

  try {
    await axios.delete(urlForInvalidate, {
      headers: {
        'x-API-Id': config.cdn.apiId,
        'x-API-Key': config.cdn.apiKey,
        'Content-type': 'application/json',
      },
    });
  } catch (error) {
    const cdnResponseMessage = JSON.stringify(error.response.data);
    const message = `Request failed with status code ${error.response.status} and message ${cdnResponseMessage}`;
    throw new Error(message);
  }

  return `Cache CDN invalidé pour l‘application ${application}.`;
}

export default { invalidateCdnCache };
