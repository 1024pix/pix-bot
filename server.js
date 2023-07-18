// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

const path = require('path');
const Hapi = require('@hapi/hapi');
const config = require('./config');
const runDeployConfiguration = require('./run/deploy-configuration');
const runManifest = require('./run/manifest');
const buildManifest = require('./build/manifest');
const { slackConfig } = require('./common/config');
const manifests = [runManifest, buildManifest];
const preResponseHandler = require('./common/pre-response-handler');

const setupErrorHandling = function (server) {
  server.ext('onPreResponse', preResponseHandler.handleErrors);
};

const server = Hapi.server({
  port: config.port,
});

setupErrorHandling(server);

['/build', '/run', '/common'].forEach((subDir) => {
  const routesDir = path.join(__dirname, subDir, '/routes');
  require('fs')
    .readdirSync(routesDir)
    .filter((file) => path.extname(file) === '.js')
    .forEach((file) => server.route(require(path.join(routesDir, file))));
});

runDeployConfiguration.forEach((configuration) => {
  runManifest.registerSlashCommand({
    ...configuration.slashCommand
    path: `/slack/commands${configuration.slashCommand.command}`,
    should_escape: false,
    handler: () => {}
  });
});

manifests.forEach((manifest) => {
  const routes = manifest.getHapiRoutes().map((route) => {
    return {
      ...route,
      config: slackConfig,
    };
  });
  server.route(routes);
});

module.exports = server;
