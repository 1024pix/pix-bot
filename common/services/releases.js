const util = require('util');
const exec = util.promisify(require('child_process').exec);

const config = require('../../config');
const github = require('./github');
const ScalingoClient = require('./scalingo-client');
const logger = require('./logger');

const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

module.exports = {
  environments: {
    recette: 'recette',
    production: 'production',
  },

  async publish(releaseType, branchName) {
    const scriptFileName = 'publish.sh';
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedBranchName = _sanitizedArgument(branchName);
      const repositoryURL = `https://${config.github.token}@github.com/${config.github.owner}/${config.github.repository}.git`;
      const newPackageVersion = await _runScriptWithArgument(
        scriptFileName,
        sanitizedReleaseType,
        repositoryURL,
        sanitizedBranchName,
      );
      return newPackageVersion;
    } catch (err) {
      logger.error({ event: 'release', message: err });
      throw err;
    }
  },

  async deploy(environment, releaseTag) {
    const sanitizedEnvironment = _sanitizedArgument(environment);
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);

    const client = await ScalingoClient.getInstance(sanitizedEnvironment);

    const results = await Promise.all(
      config.PIX_APPS.map((pixApp) => {
        return client.deployFromArchive(`pix-${pixApp}`, sanitizedReleaseTag);
      }),
    );

    return results;
  },

  async publishPixRepo(repoName, releaseType) {
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedRepoName = _sanitizedArgument(repoName);
      const branchName = await github.getDefaultBranch(config.github.owner, sanitizedRepoName);
      const repositoryURL = `https://${config.github.token}@github.com/${config.github.owner}/${sanitizedRepoName}.git`;
      const args = [config.github.owner, sanitizedRepoName, sanitizedReleaseType, branchName, repositoryURL];
      const newPackageVersion = await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
      logger.ok({
        event: 'release',
        message:
          'Type: ' +
          releaseType +
          ' , reponame ' +
          repoName +
          ' , Repo URL : ' +
          repositoryURL +
          ' , Package version : ' +
          newPackageVersion,
      });
      return newPackageVersion;
    } catch (err) {
      logger.error({ event: 'release', message: err });
      throw err;
    }
  },

  async deployPixRepo(repoName, appName, releaseTag, environment) {
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);
    const sanitizedRepoName = _sanitizedArgument(repoName);
    const sanitizedAppName = _sanitizedArgument(appName);
    try {
      const client = await ScalingoClient.getInstance(environment);
      logger.info('Deploy : ' + sanitizedAppName + ' | Tag ' + sanitizedReleaseTag + ' | Repo  : ', sanitizedRepoName);
      return client.deployFromArchive(sanitizedAppName, sanitizedReleaseTag, sanitizedRepoName);
    } catch (err) {
      logger.error({ event: 'deploy', message: err });
      throw err;
    }
  },

  _runScriptWithArgument,
};

async function _runScriptWithArgument(scriptFileName, ...args) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const { stdout, stderr } = await exec(`${scriptsDirectory}/${scriptFileName} ${args.join(' ')}`);
  logger.error({ event: 'release', message: `stdout: ${stdout}` });
  const lastLine = stdout.split('\n').slice(-2, -1).pop();
  logger.error({ event: 'release', message: `stderr: ${stderr}` });
  return lastLine;
}

function _sanitizedArgument(param) {
  return param ? param.trim().toLowerCase() : null;
}
