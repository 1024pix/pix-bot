// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
import * as dotenv from 'dotenv';
dotenv.config();

import * as Hapi from '@hapi/hapi';

import buildManifest from './build/manifest.js';
import githubRoutes from './build/routes/github.js';
import buildRoutesManifest from './build/routes/manifest.js';
import scalingoRoutes from './build/routes/scalingo.js';
import { commonConfig } from './common/config.js';
import * as preResponseHandler from './common/pre-response-handler.js';
import { registerSlashCommands } from './common/register-slash-commands.js';
import commonRoutesIndex from './common/routes/index.js';
import { config } from './config.js';
import * as runDeployConfiguration from './run/deploy-configuration.js';
import runManifest from './run/manifest.js';
import runRoutesApplication from './run/routes/applications.js';
import deploySitesRoutes from './run/routes/deploy-sites.js';
import runRoutesManifest from './run/routes/manifest.js';
import runGitHubRoutes from './run/routes/github.js';

const manifests = [runManifest, buildManifest];
const setupErrorHandling = function (server) {
  server.ext('onPreResponse', preResponseHandler.handleErrors);
};

const server = Hapi.server({
  port: config.port,
});

setupErrorHandling(server);

server.route(githubRoutes);
server.route(commonRoutesIndex);
server.route(runRoutesManifest);
server.route(buildRoutesManifest);
server.route(runRoutesApplication);
server.route(scalingoRoutes);
server.route(deploySitesRoutes);
server.route(runGitHubRoutes);

registerSlashCommands(runDeployConfiguration.deployConfiguration, runManifest);

manifests.forEach((manifest) => {
  const routes = manifest.getHapiRoutes().map((route) => {
    return {
      ...route,
      config: commonConfig.slackConfig,
    };
  });
  server.route(routes);
});

export default server;
