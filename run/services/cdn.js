import axios from 'axios';
import axiosRetry from 'axios-retry';
import _ from 'lodash';

import { logger } from '../../common/services/logger.js';
import { config } from '../../config.js';

const CDN_URL = 'https://console.baleen.cloud/api';

class NamespaceNotFoundError extends Error {
  constructor() {
    const message = `A namespace could not been found.`;
    super(message);
  }
}

async function _getNamespaceKey(applications) {
  const urlForAccountDetails = `${CDN_URL}/account`;
  const accountDetails = await axios.get(urlForAccountDetails, {
    headers: {
      'X-Api-Key': config.cdn.pat,
      'Content-type': 'application/json',
    },
  });

  const namespaces = applications.map((app) => config.cdn.appNamespaces[app]);
  const namespaceKeys = namespaces
    .map((namespace) => {
      return _.findKey(accountDetails.data.namespaces, (v) => {
        return v === namespace;
      });
    })
    .filter((n) => Boolean(n));

  if (namespaceKeys.length !== applications.length) {
    throw new NamespaceNotFoundError();
  }

  return namespaceKeys;
}

async function invalidateCdnCache(application) {
  const namespaceKey = await _getNamespaceKey([application]);
  const urlForInvalidate = `${CDN_URL}/cache/invalidations`;

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
    await axios.post(
      urlForInvalidate,
      {
        patterns: ['.'],
      },
      {
        headers: {
          'X-Api-Key': config.cdn.pat,
          'Content-type': 'application/json',
          Cookie: `baleen-namespace=${namespaceKey}`,
        },
      },
    );
  } catch (error) {
    const cdnResponseMessage = JSON.stringify(error.response.data);
    const message = `Request failed with status code ${error.response.status} and message ${cdnResponseMessage}`;
    throw new Error(message);
  }

  return `Cache CDN invalidé pour l‘application ${application}.`;
}

export default { invalidateCdnCache, NamespaceNotFoundError };
