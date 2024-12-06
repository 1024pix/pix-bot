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
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
    },
  });

  const namespaces = applications.map((app) => config.baleen.appNamespaces[app]);
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

async function blockAccess({ ip, ja3, monitorId }) {
  if (!ip || ip === '') {
    throw new Error('ip cannot be empty.');
  }

  if (!ja3 || ja3 === '') {
    throw new Error('ja3 cannot be empty.');
  }

  const namespaceKeys = await _getNamespaceKey(config.baleen.protectedFrontApps);

  for (const namespaceKey of namespaceKeys) {
    try {
      await axios.post(
        `${CDN_URL}/configs/custom-static-rules`,
        {
          category: 'block',
          name: `Blocage ip: ${ip} ja3: ${ja3}`,
          description: `Blocage automatique depuis le monitor Datadog ${monitorId}`,
          enabled: true,
          labels: ['automatic-rule'],
          conditions: [
            [
              { type: 'ip', operator: 'match', value: ip },
              { type: 'ja3', operator: 'equals', value: ja3 },
            ],
          ],
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
  }

  return `Règle de blocage mise en place.`;
}

export { blockAccess, invalidateCdnCache, NamespaceNotFoundError };
