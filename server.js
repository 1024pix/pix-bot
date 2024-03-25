// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
import * as dotenv from 'dotenv';
dotenv.config();

import * as path from 'path';
import * as Hapi from '@hapi/hapi';
import config from './config.js';
import * as runDeployConfiguration from './run/deploy-configuration.js';
import { registerSlashCommands } from './common/register-slash-commands.js';
import runManifest from './run/manifest.js';
import buildManifest from './build/manifest.js';
import { commonConfig } from './common/config.js';
import * as preResponseHandler from './common/pre-response-handler.js';
import * as fs from 'fs';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const manifests = [runManifest, buildManifest];
const setupErrorHandling = function (server) {
  server.ext('onPreResponse', preResponseHandler.handleErrors);
};

const server = Hapi.server({
  port: config.port,
});

setupErrorHandling(server);

async function loadRoutes() {
  for (const subDir of ['/build', '/run', '/common']) {
    const routesDir = path.join(__dirname, subDir, '/routes');
    const files = fs.readdirSync(routesDir).filter((file) => path.extname(file) === '.js');

    for (const file of files) {
      server.route(await import(path.join(routesDir, file)));
    }
  }
}

loadRoutes();

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
