const util = require('util');
const exec = util.promisify(require('child_process').exec);

const config = require('../../config');
const github = require('./github');
const ScalingoClient = require('./scalingo-client');

const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

module.exports = {

  environments: {
    recette: 'recette',
    production: 'production'
  },

  async publish(releaseType, branchName) {
    const scriptFileName = 'publish.sh';
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedBranchName = _sanitizedArgument(branchName);
      const newPackageVersion = await _runScriptWithArgument(scriptFileName, sanitizedReleaseType, sanitizedBranchName);
      return newPackageVersion;
    } catch (err) {
      console.error(err);
      throw err;
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

  async publishPixRepo(repoName, releaseType) {
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedRepoName = _sanitizedArgument(repoName);
      const branchName = await github.getDefaultBranch(config.github.owner, sanitizedRepoName);
      const args = [config.github.owner, sanitizedRepoName, sanitizedReleaseType, branchName];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async deployPixRepo(repoName, appName, releaseTag, environment) {
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);
    const sanitizedRepoName = _sanitizedArgument(repoName);
    const sanitizedAppName = _sanitizedArgument(appName);
    const client = await ScalingoClient.getInstance(environment);

    return client.deployFromArchive(sanitizedAppName, sanitizedReleaseTag, sanitizedRepoName);
  },

  _runScriptWithArgument,
};

async function _runScriptWithArgument (scriptFileName, ...args) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const {stdout, stderr} = await exec(`${scriptsDirectory}/${scriptFileName} ${args.join(' ')}`);
  console.log(`stdout: ${stdout}`);
  const lastLine = stdout.split('\n').slice(-2, -1).pop();
  console.error(`stderr: ${stderr}`);
  return lastLine;
}

function _sanitizedArgument(param) {
  return param? param.trim().toLowerCase(): null;
}
