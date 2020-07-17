const process = require('process');
const util = require('util');
const config = require('../config');
const ScalingoClient = require('./scalingo-client');
const exec = util.promisify(require('child_process').exec);

const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

module.exports = {

  environments: {
    recette: 'recette',
    production: 'production'
  },

  async publish(releaseType) {
    const scriptFileName = 'publish.sh';
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      await _runScriptWithArgument(scriptFileName, sanitizedReleaseType);
    } catch (err) {
      console.error(err);
    }
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

  async publishPixSite(releaseType) {
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const args = ['1024pix', 'pix-site', sanitizedReleaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
    }
  },

  async deployPixSite(releaseTag) {
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);

    const client = await ScalingoClient.getInstance('production');
    return client.deployFromArchive('pix-site', sanitizedReleaseTag, 'pix-site');
  },

  async releaseAndDeployPixPro(versionType) {
    try {
      const releaseType = _sanitizedArgument(versionType);
      const args = ['1024pix', 'pix-pro', releaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
    }
  },

  async releaseAndDeployPixBotTest(versionType) {
    try {
      const releaseType = _sanitizedArgument(versionType);
      const args = ['1024pix', 'pix-bot-release-test', releaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
    }
  }
};

async function _runScriptWithArgument (scriptFileName, ...args) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const {stdout, stderr} = await exec(`${scriptsDirectory}/${scriptFileName} ${args.join(' ')}`);
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}
function _sanitizedArgument(param) {
  return param? param.trim().toLowerCase(): null;
}
