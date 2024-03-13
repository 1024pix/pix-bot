// As early as possible in your application, require and configure dotenv.
// https://www.npmjs.com/package/dotenv#usage
import * as dotenv from 'dotenv';
dotenv.config();

import * as path from 'path';
import * as Hapi from '@hapi/hapi';
import { config } from './config.js';
import * as runDeployConfiguration from './run/deploy-configuration';
import { registerSlashCommands } from './common/register-slash-commands';
import * as runManifest from './run/manifest';
import * as buildManifest from './build/manifest';
import { slackConfig } from './common/config';
import * as preResponseHandler from './common/pre-response-handler';
import * as fs from 'fs';

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
    .forEach((file) => server.route(require(path.join(routesDir, file))));
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

export { server };
