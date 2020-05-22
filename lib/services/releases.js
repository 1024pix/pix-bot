const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function _sanitizedArgument(releaseTag) {
  return releaseTag.trim().toLowerCase();
}

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
    const scriptFileName = `release-pix-site.sh`;
    try {
      const releaseType = _sanitizedArgument(versionType);
      await _runScriptWithArgument(scriptFileName, releaseType);
    } catch (err) {
      console.error(err);
    }
  }
};

async function _runScriptWithArgument (scriptFileName, argument) {
  const scriptsDirectory = `${process.cwd()}/scripts`;
  const {stdout, stderr} = await exec(`${scriptsDirectory}/${scriptFileName} ${argument}`);
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
}
