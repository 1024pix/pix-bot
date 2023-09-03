const { fromBranch, deployTagUsingSCM } = require('../common/deployer');

module.exports = [
  {
    slashCommand: {
      command: '/deploy-metabase',
      description: 'Déploie metabase',
      usage_hint: '/deploy-metabase',
    },
    slackReturnText: 'Commande de déploiement de Metabase en production bien reçue.',
    deployFunction: fromBranch(
      'metabase-deploy',
      ['pix-metabase-production', 'pix-data-metabase-production'],
      'master',
    ),
  },
  {
    slashCommand: {
      command: '/deploy-pix-apim',
      description: 'Pour déployer les applications Pix APIM depuis la branche main',
      usage_hint: '/deploy-pix-apim',
    },
    slackReturnText: 'Commande de déploiement de Pix APIM en production bien reçue.',
    deployFunction: fromBranch('pix-nginx-apim', ['pix-nginx-apim-production'], 'main'),
  },
  {
    slashCommand: {
      command: '/deploy-geoapi',
      description: 'Déploie GeoAPI en production depuis la branche main',
      usage_hint: '/deploy-geoapi',
    },
    slackReturnText: 'Commande de déploiement de GeoAPI en production bien reçue.',
    deployFunction: fromBranch('geoapi', ['pix-geoapi-production'], 'main'),
  },
  {
    slashCommand: {
      command: '/deploy-pix-360',
      description: 'Pour déployer pix 360 depuis la branche main',
      usage_hint: '/deploy-pix-360',
    },
    slackReturnText: 'Commande de déploiement de Pix 360 en production bien reçue.',
    deployFunction: fromBranch('pix-360', ['pix-360-production'], 'main'),
  },
  {
    slashCommand: {
      command: '/deploy-dbt',
      description: 'Déploie la version précisée de DBT en production',
      usage_hint: '/deploy-dbt $version',
    },
    slackReturnText: 'Commande de déploiement de DBT en production bien reçue.',
    async deployFunction(request) {
      const tag = request.pre.payload.text;
      await deployTagUsingSCM(['pix-dbt-production', 'pix-dbt-external-production'], tag);
    },
  },
  {
    slashCommand: {
      command: '/deploy-airflow',
      description: 'Déploie la version précisée de Airflow en production',
      usage_hint: '/deploy-airflow $version',
    },
    slackReturnText: 'Commande de déploiement de Airflow en production bien reçue.',
    async deployFunction(request) {
      const tag = request.pre.payload.text;
      await deployTagUsingSCM(['pix-airflow-production'], tag);
    },
  },
];
