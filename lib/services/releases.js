const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

   async deploy(releaseTag) {
    const scriptFileName = `deploy.sh`;
    try {
      const sanitizedReleaseTag = _sanitizedArgument(releaseTag);
      await _runScriptWithArgument(scriptFileName, sanitizedReleaseTag);
    } catch (err) {
      console.error(err);
    }
  },

  async releaseAndDeployPixSite(versionType) {
    const scriptFileName = `release-pix-repo.sh`;
    try {
      const releaseType = _sanitizedArgument(versionType);
      const arguments = ['pix-site', releaseType];
      await _runScriptWithArgument(scriptFileName, ...arguments);
    } catch (err) {
      console.error(err);
    }
  },

  async releaseAndDeployPixPro(versionType) {
    const scriptFileName = `release-pix-repo.sh`;
    try {
      const releaseType = _sanitizedArgument(versionType);
      const arguments = ['pix-pro', releaseType];
      await _runScriptWithArgument(scriptFileName, ...arguments);
    } catch (err) {
      console.error(err);
    }
  },

  async releaseAndDeployPixBotTest(versionType) {
    const scriptFileName = `release-pix-repo.sh`;
    try {
      const releaseType = _sanitizedArgument(versionType);
      const arguments = ['pix-bot-release-test', releaseType];
      await _runScriptWithArgument(scriptFileName, ...arguments);
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
function _sanitizedArgument(releaseTag) {
  return releaseTag? releaseTag.trim().toLowerCase(): null;
}
