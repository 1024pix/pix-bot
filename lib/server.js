const Hapi = require('@hapi/hapi');
const { name, version, description } = require('../package');

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

module.exports = server;