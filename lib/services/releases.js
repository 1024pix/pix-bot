const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {

  async publish(releaseType) {
    try {
      const sanitizedReleaseType = releaseType.trim().toLowerCase();
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/publish.sh ${sanitizedReleaseType}`);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    } catch (err) {
      console.error(err);
    }
  },

  async deploy(releaseTag) {
    try {
      const sanitizedReleaseTag = releaseTag.trim().toLowerCase();
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/deploy.sh ${sanitizedReleaseTag}`);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    } catch (err) {
      console.error(err);
    }
  },

  async createAndDeployPixSite(versionType) {
    try {
      const releaseType = versionType.trim().toLowerCase();
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/release-pix-site.sh ${releaseType}`);
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    } catch (err) {
      console.error(err);
    }
  }
};
