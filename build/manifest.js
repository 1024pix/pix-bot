const { Manifest } = require('../common/models/Manifest');
const slackbotController = require('./controllers/slack');
const googleSheet = require('./services/google-sheet');

const manifest = new Manifest('Pix Bot Build');

manifest.registerSlashCommand({
  command: '/pr-pix',
  path: '/slack/commands/pull-requests',
  description: "Afficher les PR à review de l'application Pix",
  usage_hint: '[cross-team|team-acces|team-evaluation|team-certif|team-prescription]',
  should_escape: false,
  handler: slackbotController.getPullRequests,
});

manifest.registerSlashCommand({
  command: '/tips-a11y',
  path: '/slack/commands/accessibility-tip',
  description: "Je veux un tips sur l'accessibilité !",
  should_escape: false,
  handler: googleSheet.getA11YTip,
});

manifest.registerSlashCommand({
  command: '/changelog',
  path: '/slack/commands/changelog',
  description: 'Afficher le changelog depuis la dernière release',
  should_escape: false,
  handler: slackbotController.getChangelogSinceLatestRelease,
});

manifest.registerSlashCommand({
  command: '/hotfix',
  path: '/slack/commands/create-and-deploy-pix-hotfix',
  description: "Créer une version patch à partir d'une branche et la déployer en recette",
  usage_hint: '[branch-name]',
  should_escape: false,
  handler: slackbotController.createAndDeployPixHotfix,
});

manifest.registerSlashCommand({
  command: '/mob',
  path: '/slack/commands/mob',
  description: "Afficher des couples pilote/co-pilote à partir d'une liste de participants",
  usage_hint: "[@quelqu'un @quelqu'une]",
  should_escape: false,
  handler: slackbotController.startMobRoles,
});

manifest.registerSlashCommand({
  command: '/scalingo-create-app',
  path: '/slack/commands/scalingo-create-app',
  description: "Création d'application sur scalingo",
  usage_hint: '[app-name environment]',
  should_escape: false,
  handler: slackbotController.createAppOnScalingo,
});

manifest.registerShortcut({
  name: 'Publier une version/MER',
  type: 'global',
  callback_id: 'publish-release',
  description: "Publie une nouvelle version et la déploie sur l'environnement de recette",
});

manifest.addInteractivity({
  path: '/build/slack/interactive-endpoint',
  handler: slackbotController.interactiveEndpoint,
});

module.exports = manifest;
