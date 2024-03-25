import axios from 'axios';
import * as axiosRetry from 'axios-retry';
axiosRetry.default;
import config from '../../config.js';
import * as logger from '../../common/services/logger.js';
import * as _ from 'lodash';

const CDN_URL = 'https://console.baleen.cloud/api';

class NamespaceNotFoundError extends Error {
  constructor(application) {
    const message = `Namespace for the application: ${application} are not found`;
    super(message);
  }
}

async function _getNamespaceKey(application) {
  const urlForAccountDetails = `${CDN_URL}/account`;
  const accountDetails = await axios.get(urlForAccountDetails, {
    headers: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
    },
  });

  const namespaces = config.baleen.appNamespaces;
  const namespace = _.find(namespaces, (v, k) => {
    return k === application;
  });

  const namespaceKey = _.findKey(accountDetails.data.namespaces, (v) => {
    return v === namespace;
  });

  if (!namespaceKey) {
    throw new NamespaceNotFoundError(application);
  }

  return namespaceKey;
}

async function invalidateCdnCache(application) {
  const namespaceKey = await _getNamespaceKey(application);
  const urlForInvalidate = `${CDN_URL}/cache/invalidations`;

  axiosRetry(axios, {
    retries: config.baleen.CDNInvalidationRetryCount,
    retryDelay: (retryCount) => {
      logger.info({
        event: 'cdn',
        message: `Cache invalidation retry for application ${application}: ${retryCount}`,
      });

      return retryCount * config.baleen.CDNInvalidationRetryDelay;
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
          'X-Api-Key': config.baleen.pat,
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

export { invalidateCdnCache, NamespaceNotFoundError };
