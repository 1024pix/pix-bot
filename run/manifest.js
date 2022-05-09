const { Manifest } = require('../common/models/Manifest');
const slackbotController = require('./controllers/slack');

const manifest = new Manifest('Pix Bot Run');

manifest.registerSlashCommand({
  command: '/deploy-pix-sites',
  path: '/slack/commands/create-and-deploy-pix-site-release',
  description: 'Pour faire une release et deployer les sites Pix, Pix Pro et Pix org',
  usage_hint: 'patch|minor|major (minor par défaut)',
  should_escape: false,
  handler: slackbotController.createAndDeployPixSiteRelease,
});

manifest.registerSlashCommand({
  command: '/publish-pix-ui',
  path: '/slack/commands/create-and-deploy-pix-ui-release',
  description: 'Crée une release de Pix-UI et la déploie sur les Github pages !',
  usage_hint: '[patch, minor, major]',
  should_escape: false,
  handler: slackbotController.createAndDeployPixUIRelease,
});

manifest.registerSlashCommand({
  command: '/deploy-pix-lcms',
  path: '/slack/commands/create-and-deploy-pix-lcms-release',
  description: 'Crée une release de Pix-LCMS et la déploie en production (https://lcms-api.pix.fr)',
  usage_hint: '[patch, minor, major]',
  should_escape: false,
  handler: slackbotController.createAndDeployPixLCMSRelease,
});

manifest.registerSlashCommand({
  command: '/deploy-pix-datawarehouse',
  path: '/slack/commands/create-and-deploy-pix-datawarehouse-release',
  description: 'Crée une release de Pix-Datawarehouse et la déploie en production (pix-datawarehouse-production & pix-datawarehouse-ex-production)',
  usage_hint: '[patch, minor, major]',
  should_escape: false,
  handler: slackbotController.createAndDeployPixDatawarehouseRelease,
});

manifest.registerSlashCommand({
  command: '/deploy-pix-bot',
  path: '/slack/commands/create-and-deploy-pix-bot-release',
  description: 'Releaser et déployer pix-bot-run et pix-bot-build',
  usage_hint: '[patch, minor, major]',
  should_escape: false,
  handler: slackbotController.createAndDeployPixBotRelease,
});

manifest.registerSlashCommand({
  command: '/app-status',
  path: '/slack/commands/app-status',
  description: 'Returns the app status given the app name as parameter',
  usage_hint: '[pix-app-production, production]',
  should_escape: false,
  handler: slackbotController.getAppStatus,
});

manifest.registerSlashCommand({
  command: '/deploy-last-version',
  path: '/slack/commands/deploy-last-version',
  description: 'Deploy last version of an app',
  usage_hint: '[pix-admin-production]',
  should_escape: false,
  handler: slackbotController.deployLastVersion,
});

manifest.registerSlashCommand({
  command: '/deploy-ember-testing-library',
  path: '/slack/commands/create-and-deploy-ember-testing-library-release',
  description: 'Crée une release de Ember-testing-library',
  usage_hint: '[patch, minor, major]',
  should_escape: false,
  handler: slackbotController.createAndDeployEmberTestingLibraryRelease,
});

manifest.registerShortcut({
  name: 'Déployer une version/MEP',
  type: 'global',
  callback_id: 'deploy-release',
  description: 'Lance le déploiement d\'une version sur l\'environnement de production'
});

manifest.addInteractivity({
  path: '/run/slack/interactive-endpoint',
  handler: slackbotController.interactiveEndpoint,
});

module.exports = manifest;
