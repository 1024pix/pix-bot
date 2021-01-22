const axios = require('axios');
const config = require('../config');
const _ = require('lodash');

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
    }
  });

  const namespaces = config.baleen.appNamespaces;
  const namespace = _.find(namespaces, (v, k) => { return k === application; });

  const namespaceKey = _.findKey(accountDetails.data.namespaces, (v) => { return v === namespace; });

  if (!namespaceKey) {
    throw new NamespaceNotFoundError(application);
  }

  return namespaceKey;
}

async function invalidateCdnCache(application) {
  const namespaceKey = await _getNamespaceKey(application);
  const urlForInvalidate = `${CDN_URL}/cache/invalidations`;

  await axios.post(urlForInvalidate, {
    patterns: [ '.' ]
  }, {
    headers: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
      'Cookie': `baleen-namespace=${namespaceKey}`,
    }
  });

  return `Cache CDN invalidé pour l‘application ${application}.`;
}

module.exports = {
  invalidateCdnCache,
  NamespaceNotFoundError
};
