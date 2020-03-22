const path = require('path');
const Hapi = require('@hapi/hapi');

const server = Hapi.server({
  port: process.env.PORT || 3000,
});

const routesDir = path.join(__dirname, 'routes');
require('fs').readdirSync(routesDir).forEach((file) => {
  server.route(require(path.join(routesDir, file)));
});

module.exports = server;
