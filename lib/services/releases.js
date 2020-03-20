const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  async deploy(version) {
    try {
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/deploy.sh ${version}`);

      console.log(stdout);
      console.error(stderr);

      return { message: 'Release deployed 🚀', stdout, stderr };
    } catch (err) {
      console.error(err);
      return h.response(err).code(500);
    }
  }
};