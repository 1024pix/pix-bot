const Hapi = require('@hapi/hapi');
const { name, version, description } = require('../package');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const server = Hapi.server({
  port: process.env.PORT || 3000,
});

server.route({
  method: 'GET',
  path: '/',
  handler: async (request, h) => {
    return {
      name, version, description
    };
  }
});

server.route({
    method: 'POST',
    path: '/deploy',
    handler: async (request, h) => {
        if (request.payload.authorizationToken === process.env.AUTHORIZATION_TOKEN) {
            async function deploy() {
                try {
                    const { stdout, stderr } = await exec(`${process.env.DIR_SCRIPT}/scripts/deploy.sh`);
                    console.log('stdout:', stdout);
                    console.log('stderr:', stderr);
                } catch (err) {
                    console.error(err);
                };
            };
            await deploy();
            return 'Release deployed';
        } else {
            return h.response().code(403);
        }
    }
});

module.exports = server;
