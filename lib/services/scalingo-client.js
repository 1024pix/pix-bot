const scalingo = require('scalingo');
const config = require('../config');

class ScalingoClient {
  constructor(client, environment) {
    this.client = client;
    this.environment = environment;
  }

  static async getInstance(environment) {
    const { token, apiUrl } = config.scalingo[environment];
    const client = await scalingo.clientFromToken(token, { apiUrl });
    return new ScalingoClient(client, environment);
  }

  async deployFromArchive(pixApp, releaseTag, repository = config.github.repository) {
    if (!pixApp) {
      throw new Error('No application to deploy.');
    }
    if (!releaseTag) {
      throw new Error('No release tag to deploy.');
    }

    const scalingoApp = `${pixApp}-${this.environment}`;

    try {
      await this.client.apiClient().post(
        `/apps/${scalingoApp}/deployments`,
        {
          deployment: {
            git_ref: releaseTag,
            source_url: `https://${config.github.token}@github.com/${config.github.owner}/${repository}/archive/${releaseTag}.tar.gz`
          }
        });
    } catch (e) {
      console.error(e);
      throw new Error(`Impossible to deploy ${scalingoApp} ${releaseTag}`);
    }

    return `Deployed ${scalingoApp} ${releaseTag}`;
  }
}


module.exports = ScalingoClient;
