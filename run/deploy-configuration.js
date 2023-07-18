const { fromBranch } = require('../common/deployer');
module.exports = {
  metabase: {
    slashCommand: {
      command: '/deploy-metabase',
      description: 'Déploie metabase',
      usage_hint: '/deploy-metabase',
    },
    deployFunction: fromBranch('metabase-deploy', ['pix-metabase-production', 'pix-data-metabase-production'], 'master'),
  },
};
