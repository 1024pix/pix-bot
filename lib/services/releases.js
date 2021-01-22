const process = require('process');
const util = require('util');
const config = require('../../config');
const exec = util.promisify(require('child_process').exec);

const RELEASE_PIX_SCRIPT = 'release-pix-repo.sh';

module.exports = {

  environments: {
    recette: 'recette',
    production: 'production'
  },

  async releaseAndDeployPixBotTest(versionType) {
    try {
      const releaseType = _sanitizedArgument(versionType);
      const args = [config.github.owner, 'pix-bot-release-test', releaseType];
      await _runScriptWithArgument(RELEASE_PIX_SCRIPT, ...args);
    } catch (err) {
      console.error(err);
      throw err;
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
