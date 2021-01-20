const config = require('../../config');
const ScalingoClient = require('../../common/services/scalingo-client');

module.exports = {

  environments: {
    recette: 'recette',
    production: 'production'
  },

  async deploy(environment, releaseTag) {
    const sanitizedEnvironment = _sanitizedArgument(environment);
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);

    const client = await ScalingoClient.getInstance(sanitizedEnvironment);

    const results = await Promise.all(config.pixApps.map(pixApp => {
      return client.deployFromArchive(pixApp, sanitizedReleaseTag);
    }));

    return results;
  },
};

function _sanitizedArgument(param) {
  return param? param.trim().toLowerCase(): null;
}
