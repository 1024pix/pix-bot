const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {

  async publish(versionType) {
    try {
      const releaseType = versionType.trim().toLowerCase();
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/publish.sh ${releaseType}`);

      console.log(stdout);
      console.error(stderr);

      return { message: 'Release published 🎁', stdout, stderr };
    } catch (err) {
      console.error(err);
    }
  },

  async deploy(releaseTag) {
    try {
      const treatedReleaseTag = releaseTag.trim().toLowerCase();
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/deploy.sh ${treatedReleaseTag}`);

      console.log(stdout);
      console.error(stderr);

      return { message: 'Release deployed 🚀', stdout, stderr };
    } catch (err) {
      console.error(err);
    }
  },

  async createAndDeployPixSite(versionType) {
    try {
      const releaseType = versionType.trim().toLowerCase();
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/release-pix-site.sh ${releaseType}`);

      console.log(stdout);
      console.error(stderr);

      return { message: 'Release deployed 🚀', stdout, stderr };
    } catch (err) {
      console.error(err);
    }
  }
};
