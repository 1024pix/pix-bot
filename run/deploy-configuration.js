const { fromBranch } = require('../common/deployer');

module.exports = [
  {
    slashCommand: {
      command: '/deploy-metabase',
      description: 'Déploie metabase',
      usage_hint: '/deploy-metabase',
    },
    slackReturnText: 'Commande de déploiement de Metabase en production bien reçue.',
    deployFunction: fromBranch('metabase-deploy', ['pix-metabase-production', 'pix-data-metabase-production'], 'master'),
  },
];
