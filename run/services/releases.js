const ScalingoClient = require('../../common/services/scalingo-client');

const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

module.exports = {

  async deployPixRepo(repoName, appName, releaseTag) {
    const sanitizedReleaseTag = _sanitizedArgument(releaseTag);
    const sanitizedRepoName = _sanitizedArgument(repoName);
    const sanitizedAppName = _sanitizedArgument(appName);

    const client = await ScalingoClient.getInstance('production');
    return client.deployFromArchive(sanitizedAppName, sanitizedReleaseTag, sanitizedRepoName);
  },

  async publishPixRepo(repoName, releaseType) {
    try {
      const sanitizedReleaseType = _sanitizedArgument(releaseType);
      const sanitizedRepoName = _sanitizedArgument(repoName);
      const args = [config.github.owner, sanitizedRepoName, sanitizedReleaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

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
