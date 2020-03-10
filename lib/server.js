const Hapi = require('@hapi/hapi');

const server = Hapi.server({
  port: process.env.PORT || 3000,
});

server.route(require('./routes/index'));

module.exports = server;