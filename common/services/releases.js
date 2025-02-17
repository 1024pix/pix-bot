import child_process from 'node:child_process';
import util from 'node:util';

import { config } from '../../config.js';
import github from './github.js';
import { logger } from './logger.js';
import ScalingoClient from './scalingo-client.js';

const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

const releasesService = {
  environments: {
    recette: 'recette',
    production: 'production',
  },

  async publish(releaseType, branchName, exec = util.promisify(child_process.exec)) {
    const scriptFileName = 'publish.sh';
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedBranchName = _sanitizedArgument(branchName);
      const repositoryURL = `https://${config.github.token}@github.com/${config.github.owner}/${config.github.repository}.git`;
      const newPackageVersion = await _runScriptWithArgument(
        scriptFileName,
        exec,
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
        return client.deployFromArchive(pixApp, sanitizedReleaseTag);
      }),
    );

    return results;
  },

  async publishPixRepo(repoName, releaseType, exec = util.promisify(child_process.exec)) {
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedRepoName = _sanitizedArgument(repoName);
      const branchName = await github.getDefaultBranch(config.github.owner, sanitizedRepoName);
      const repositoryURL = `https://${config.github.token}@github.com/${config.github.owner}/${sanitizedRepoName}.git`;
      const args = [config.github.owner, sanitizedRepoName, sanitizedReleaseType, branchName, repositoryURL];
      const newPackageVersion = await _runScriptWithArgument(RELEASE_PIX_SCRIPT, exec, ...args);
      logger.info({
        event: 'release',
        message: `Type: ${releaseType} | Reponame : ${repoName} | Repo URL : ${repositoryURL} | Package version : ${newPackageVersion}`,
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
      logger.info({
        event: 'deploy',
        message: `Deploy: ${sanitizedAppName} | Tag: ${sanitizedReleaseTag} | Repo: ${sanitizedRepoName}`,
      });
      return client.deployFromArchive(sanitizedAppName, sanitizedReleaseTag, sanitizedRepoName);
    } catch (err) {
      logger.error({ event: 'deploy', message: err });
      throw err;
    }
  },
};

async function _runScriptWithArgument(scriptFileName, exec, ...args) {
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

export default releasesService;
