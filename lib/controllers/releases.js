const process = require('process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {

  async deployRelease(request, h) {
    if (!request.payload || !request.payload.authorizationToken) {
      return h.response().code(401);
    }

    if (request.payload.authorizationToken !== process.env.AUTHORIZATION_TOKEN) {
      return h.response().code(403);
    }

    try {
      const scriptsDirectory = `${process.cwd()}/scripts`;
      const { stdout, stderr } = await exec(`${scriptsDirectory}/deploy.sh`);

      console.log(stdout);
      console.error(stderr);

      return { message: 'Release deployed 🚀', stdout, stderr };
    } catch (err) {
      console.error(err);
      return h.response(err).code(500);
    }
  },

};
