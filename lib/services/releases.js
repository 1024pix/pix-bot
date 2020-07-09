const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
    const scriptFileName = `deploy.sh`;
    try {
      const sanitizedEnvironment = _sanitizedArgument(environment);
      const sanitizedReleaseTag = _sanitizedArgument(releaseTag);
      await _runScriptWithArgument(scriptFileName, sanitizedEnvironment, sanitizedReleaseTag);
    } catch (err) {
      console.error(err);
    }
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

async function _runScriptWithArgument (scriptFileName, ...arguments) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const {stdout, stderr} = await exec(`${scriptsDirectory}/${scriptFileName} ${arguments.join(' ')}`);
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}
function _sanitizedArgument(param) {
  return param? param.trim().toLowerCase(): null;
}
