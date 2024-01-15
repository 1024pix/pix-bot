const { fromBranch } = require('../common/deployer');

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
      command: '/deploy-privatebin',
      description: 'Déploie privatebin',
      usage_hint: '/deploy-privatebin',
    },
    slackReturnText: 'Commande de déploiement de PrivateBin en production bien reçue.',
    deployFunction: fromBranch('privatebin-deploy', ['pix-privatebin-production'], 'main'),
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
];
