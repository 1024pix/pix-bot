const axios = require('axios');
const scalingo = require('scalingo');
const config = require('../../config');

const DEFAULT_OPTS = { withEnvSuffix: true };

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

  async deployFromArchive(pixApp, releaseTag, repository = config.github.repository, options = DEFAULT_OPTS) {
    if (!pixApp) {
      throw new Error('No application to deploy.');
    }
    if (!releaseTag) {
      throw new Error('No release tag to deploy.');
    }

    const scalingoApp = options.withEnvSuffix ? `${pixApp}-${this.environment}` : pixApp;

    try {
      await this.client.Deployments.create(scalingoApp, {
        git_ref: releaseTag,
        source_url: `https://${config.github.token}@github.com/${config.github.owner}/${repository}/archive/${releaseTag}.tar.gz`,
      });
    } catch (e) {
      console.error(e);
      throw new Error(`Unable to deploy ${scalingoApp} ${releaseTag}`);
    }

    return `${scalingoApp} ${releaseTag} has been deployed`;
  }

  async deployUsingSCM(scalingoApp, releaseTag) {
    try {
      await this.client.SCMRepoLinks.manualDeploy(scalingoApp, releaseTag);
    } catch (e) {
      console.error(e);
      throw new Error(`Unable to deploy ${scalingoApp} ${releaseTag}`);
    }

    return `Deployment of ${scalingoApp} ${releaseTag} has been requested`;
  }

  async getAppInfo(target) {
    if (['production', 'integration', 'recette'].includes(target)) {
      return await this._getAllAppsInfo(target);
    }

    return [await this._getSingleAppInfo(target)];
  }

  deployReviewApp(appName, prId) {
    return this.client.SCMRepoLinks.manualReviewApp(appName, prId);
  }

  async _getAllAppsInfo(environment) {
    const apps = ['api', 'app', 'orga', 'certif', 'admin'];
    const promises = apps.map((appName) => this._getSingleAppInfo(appName, environment));
    return Promise.all(promises);
  }

  async _getSingleAppInfo(appName, environment = 'production') {
    let scalingoAppName = appName;
    if (!appName.match(/^pix-[a-z0-9-]*$/g)) {
      scalingoAppName = `pix-${appName}-${environment}`;
    }

    try {
      const { name, url, last_deployment_id } = await this.client.Apps.find(scalingoAppName);
      const { created_at, git_ref, pusher } = await this.client.Deployments.find(scalingoAppName, last_deployment_id);
      const isUp = await _isUrlReachable(url);

      return {
        name,
        url,
        isUp,
        lastDeployementAt: created_at,
        lastDeployedBy: pusher.username,
        lastDeployedVersion: git_ref,
      };
    } catch (err) {
      if (err.status === 404) {
        throw new Error(`Impossible to get info for ${scalingoAppName}`);
      }
      throw err;
    }
  }
  async inviteCollaborator(applicationId, collaboratorEmail) {
    try {
      const { invitation_link } = await this.client.Collaborators.invite(applicationId, collaboratorEmail);
      return invitation_link;
    } catch (e) {
      console.error(JSON.stringify(e));
      throw new Error(`Impossible to invite ${collaboratorEmail} on ${applicationId}`);
    }
  }

  async createApplication(name) {
    const app = {
      name: name,
    };
    try {
      const { id } = await this.client.Apps.create(app);
      return id;
    } catch (e) {
      console.error(JSON.stringify(e));
      throw new Error(`Impossible to create ${app.name}, ${e.name}`);
    }
  }
}

async function _isUrlReachable(url) {
  let pingUrl = url;
  if (url.includes('api')) {
    pingUrl = url + '/api';
  }

  try {
    await axios.get(pingUrl, {
      timeout: 2500,
    });
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = ScalingoClient;
