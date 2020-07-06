const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios');
const config = require('../config');

const RELEASE_PIX_SCRIPT = `release-pix-repo.sh`;

module.exports = {

  async publish(releaseType) {
    const scriptFileName = `publish.sh`;
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      await _runScriptWithArgument(scriptFileName, sanitizedReleaseType);
    } catch (err) {
      console.error(err);
    }
  },

  async deploy(environment, releaseTag) {
    const bearerToken = (await axios.post('https://auth.scalingo.com/v1/tokens/exchange', '', {
      auth: { password: config.scalingo.token }
    })).data.token;

    const apps = [
      `pix-admin`,
      `pix-api`,
      `pix-app`,
      `pix-certif`,
      `pix-orga`,
    ];
    return Promise.all(apps.map(app => axios.post(`${config.scalingo.apiUrl}/v1/apps/${app}-${environment}/deployments`, {
      deployment: {
        git_ref: releaseTag,
        source_url: `https://github.com/1024pix/pix/archive/${releaseTag}.tar.gz`
      }
    }, {
      headers: { Authorization: `Bearer ${bearerToken}` }
    })));
  },

  async releaseAndDeployPixSite(versionType) {
    try {
      const releaseType = _sanitizedArgument(versionType);
      const arguments = ['pix-site', releaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...arguments);
    } catch (err) {
      console.error(err);
    }
  },

  async releaseAndDeployPixPro(versionType) {
    try {
      const releaseType = _sanitizedArgument(versionType);
      const arguments = ['pix-pro', releaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...arguments);
    } catch (err) {
      console.error(err);
    }
  },

  async releaseAndDeployPixBotTest(versionType) {
    try {
      const releaseType = _sanitizedArgument(versionType);
      const arguments = ['pix-bot-release-test', releaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...arguments);
    } catch (err) {
      console.error(err);
    }
  }
};

async function _runScriptWithArgument(scriptFileName, ...arguments) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const { stdout, stderr } = await exec(`${scriptsDirectory}/${scriptFileName} ${arguments.join(' ')}`);
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}

function _sanitizedArgument(releaseTag) {
  return releaseTag ? releaseTag.trim().toLowerCase() : null;
}
