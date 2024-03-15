// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
import * as dotenv from 'dotenv';
dotenv.config();

import * as path from 'path';
import * as Hapi from '@hapi/hapi';
import config from './config.js';
import * as runDeployConfiguration from './run/deploy-configuration.js';
import { registerSlashCommands } from './common/register-slash-commands.js';
import * as runManifest from './run/manifest.js';
import * as buildManifest from './build/manifest.js';
import slackConfig from './common/config.js';
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

['/build', '/run', '/common'].forEach((subDir) => {
  const routesDir = path.join(__dirname, subDir, '/routes');
  fs.readdirSync(routesDir)
    .filter((file) => path.extname(file) === '.js')
    .forEach((file) => server.route(await import(path.join(routesDir, file))));
});

registerSlashCommands(runDeployConfiguration, runManifest);

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
