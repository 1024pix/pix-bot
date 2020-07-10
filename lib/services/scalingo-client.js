const scalingo = require('scalingo');
const config = require('../config');

class ScalingoClient {
  constructor(client, environment) {
    this.client = client;
    this.environment = environment;
  }

  static async getInstance(environment) {  
    let apiUrl;
    if (environment === 'production') {
      apiUrl = 'https://api.osc-secnum-fr1.scalingo.com';
    }
    if (environment === 'recette') {
      apiUrl = 'https://api.osc-fr1.scalingo.com';
    }

    const client = await scalingo.clientFromToken(config.scalingo[environment].token, { apiUrl });
    return new ScalingoClient(client, environment);
  }

  async deployFromArchive(pixApp, releaseTag) {
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
            source_url: `https://github.com/${config.github.owner}/${config.github.repository}/archive/${releaseTag}.tar.gz`
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
