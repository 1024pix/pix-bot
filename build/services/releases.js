const util = require('util');
const exec = util.promisify(require('child_process').exec);

const config = require('../../config');

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
      throw err;
    }
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
