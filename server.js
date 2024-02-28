// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
require('dotenv').config();

// const path = require('path');
import path from "path"
// const Hapi = require('@hapi/hapi');
import pkg from '@hapi/hapi';
const {Hapi} = pkg;
// const config = require('./config');
import config from "./config.js";
// const runDeployConfiguration = require('./run/deploy-configuration');
import deployConfig from "./run/deploy-configuration.js"
// const { registerSlashCommands } = require('./common/register-slash-commands');
import registerSlashCommands from "./common/register-slash-commands";

// const runManifest = require('./run/manifest');
import * as runManifest  from "./run/manifest.js"
// const buildManifest = require('./build/manifest');
import  * as buildManifest from "./build/manifest";
// const { slackConfig } = require('./common/config');
import slackConfig from "./common/config.js";
const manifests = [runManifest, buildManifest];

// const preResponseHandler = require('./common/pre-response-handler');
import * as preResponseHandler from "./common/pre-response-handler.js"

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

registerSlashCommands(deployConfig, runManifest);

manifests.forEach((manifest) => {
  const routes = manifest.getHapiRoutes().map((route) => {
    return {
      ...route,
      config: slackConfig,
    };
  });
  server.route(routes);
});
export default server;
