const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {

  deployRelease(request, h) {
    if (request.payload.authorizationToken === process.env.AUTHORIZATION_TOKEN) {
      async function deploy() {
        try {
          const { stdout, stderr } = await exec(`${process.env.DIR_SCRIPTS}/scripts/deploy.sh`);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
        } catch (err) {
          console.error(err);
        }
      }
      await deploy();
      return 'Release deployed';
    } else {
      return h.response().code(403);
    }
  },

};