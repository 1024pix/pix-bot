const { expect } = require('chai');
const server = require('../../../server');

describe('Acceptance | Run | Manifest', function () {
  describe('GET /run/manifest', function () {
    it('responds with 200 and returns the manifest', async function () {
      const res = await server.inject({
        method: 'GET',
        url: '/run/manifest',
      });
      const hostname = server.info.host + ':0';
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql({
        display_information: {
          name: 'Pix Bot Run',
        },
        features: {
          bot_user: {
            display_name: 'Pix Bot Run',
            always_online: false,
          },
          shortcuts: [
            {
              name: 'MEP/Déployer une version',
              type: 'global',
              callback_id: 'deploy-release',
              description: "Lance le déploiement d'une version sur l'environnement de production",
            },
            {
              name: 'Créer une appli Scalingo',
              type: 'global',
              callback_id: 'scalingo-app-creation',
              description: "Lance la création d'une application sur Scalingo",
            },
          ],
          slash_commands: [
            {
              command: '/deploy-pix-sites',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-site-release`,
              description: 'Pour faire une release et deployer les sites Pix, Pix Pro et Pix org',
              usage_hint: 'patch|minor|major (minor par défaut)',
              should_escape: false,
            },
            {
              command: '/publish-pix-ui',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-ui-release`,
              description: 'Crée une release de Pix-UI et la déploie sur les Github pages !',
              usage_hint: '[patch, minor, major]',
              should_escape: false,
            },
            {
              command: '/deploy-ember-testing-library',
              url: `http://${hostname}/slack/commands/create-and-deploy-ember-testing-library-release`,
              description: 'Crée une release de Ember-testing-library',
              usage_hint: '[patch, minor, major]',
              should_escape: false,
            },
            {
              command: '/deploy-pix-lcms',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-lcms-release`,
              description: 'Crée une release de Pix-LCMS et la déploie en production (https://lcms-api.pix.fr)',
              usage_hint: '[patch, minor, major]',
              should_escape: false,
            },
            {
              command: '/deploy-pix-api-data',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-api-data-release`,
              description: 'Crée une release de pix-api-data et la déploie en production (https://api-data.pix.fr)',
              usage_hint: '[patch, minor, major]',
              should_escape: false,
            },
            {
              command: '/deploy-pix-datawarehouse',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-datawarehouse-release`,
              description:
                'Crée une release de Pix-Datawarehouse et la déploie en production (pix-datawarehouse-production & pix-datawarehouse-ex-production)',
              usage_hint: '[patch, minor, major]',
              should_escape: false,
            },
            {
              command: '/deploy-pix-bot',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-bot-release`,
              description: 'Releaser et déployer pix-bot-run et pix-bot-build',
              usage_hint: '[patch, minor, major]',
              should_escape: false,
            },
            {
              command: '/deploy-last-version',
              url: `http://${hostname}/slack/commands/deploy-last-version`,
              description: 'Déployer sur cette application la dernière release publiée',
              usage_hint: '[pix-admin-production]',
              should_escape: false,
            },
            {
              command: '/deploy-db-stats',
              description: 'Crée une release de db stats',
              should_escape: false,
              url: `http://${hostname}/slack/commands/create-and-deploy-db-stats`,
              usage_hint: '[patch, minor, major]',
            },
            {
              command: '/deploy-pix-tutos',
              description: 'Crée une release de Pix Tutos',
              should_escape: false,
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-tutos-release`,
              usage_hint: '[patch, minor, major]',
            },
            {
              command: '/deploy-airflow',
              description: 'Déploie la version précisée de Airflow en production',
              should_escape: false,
              url: `http://${hostname}/slack/commands/deploy-airflow`,
              usage_hint: '/deploy-airflow $version',
            },
            {
              command: '/app-status',
              url: `http://${hostname}/slack/commands/app-status`,
              description: 'Returns the app status given the app name as parameter',
              usage_hint: '[pix-app-production, production]',
              should_escape: false,
            },
            {
              command: '/deploy-metabase',
              description: 'Déploie metabase',
              should_escape: false,
              url: `http://${hostname}/slack/commands/deploy-metabase`,
              usage_hint: '/deploy-metabase',
            },
            {
              command: '/deploy-pix-apim',
              description: 'Pour déployer les applications Pix APIM depuis la branche main',
              should_escape: false,
              url: `http://${hostname}/slack/commands/deploy-pix-apim`,
              usage_hint: '/deploy-pix-apim',
            },
            {
              command: '/deploy-geoapi',
              description: 'Déploie GeoAPI en production depuis la branche main',
              should_escape: false,
              url: `http://${hostname}/slack/commands/deploy-geoapi`,
              usage_hint: '/deploy-geoapi',
            },
            {
              command: '/deploy-pix-360',
              description: 'Pour déployer pix 360 depuis la branche main',
              should_escape: false,
              url: `http://${hostname}/slack/commands/deploy-pix-360`,
              usage_hint: '/deploy-pix-360',
            },
            {
              command: '/deploy-dbt',
              description: 'Déploie la version précisée de DBT en production',
              should_escape: false,
              url: `http://${hostname}/slack/commands/deploy-dbt`,
              usage_hint: '/deploy-dbt $version',
            },
          ],
        },
        oauth_config: {
          scopes: {
            bot: ['commands', 'incoming-webhook', 'chat:write'],
          },
        },
        settings: {
          interactivity: {
            is_enabled: true,
            request_url: `http://${hostname}/run/slack/interactive-endpoint`,
          },
          org_deploy_enabled: false,
          socket_mode_enabled: false,
          token_rotation_enabled: false,
        },
      });
    });
  });
});
