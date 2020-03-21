const Hapi = require('@hapi/hapi');
const router = require('./router');

const server = Hapi.server({
  port: process.env.PORT || 3000,
});

router.init(server);

module.exports = server;
