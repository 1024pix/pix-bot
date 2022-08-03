const { expect } = require('chai');
const server = require('../../../server');

describe('Acceptance | Build | Manifest', function() {
  describe('GET /build/manifest', function() {
    it('responds with 200 and returns the manifest', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/build/manifest',
      });
      const hostname = server.info.host + ':0';
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.deep.equal({
        display_information: {
          name: 'Pix Bot Build'
        },
        features: {
          bot_user: {
            display_name: 'Pix Bot Build',
            always_online: false
          },
          shortcuts: [
            {
              name: 'Publier une version/MER',
              type: 'global',
              callback_id: 'publish-release',
              description: 'Publie une nouvelle version et la déploie sur l\'environnement de recette'
            }
          ],
          slash_commands: [
            {
              command: '/pr-pix',
              url: `http://${hostname}/slack/commands/pull-requests`,
              description: 'Afficher les PR à review de l\'application Pix',
              usage_hint: '[cross-team|team-acces|team-evaluation|team-certif|team-prescription]',
              should_escape: false
            },
            {
              command: '/tips-a11y',
              url: `http://${hostname}/slack/commands/accessibility-tip`,
              description: 'Je veux un tips sur l\'accessibilité !',
              usage_hint: undefined,
              should_escape: false
            },
            {
              command: '/changelog',
              url: `http://${hostname}/slack/commands/changelog`,
              description: 'Afficher le changelog depuis la dernière release',
              usage_hint: undefined,
              should_escape: false
            },
            {
              command: '/hotfix',
              url: `http://${hostname}/slack/commands/create-and-deploy-pix-hotfix`,
              description: 'Créer une version patch à partir d\'une branche et la déployer en recette',
              usage_hint: '[branch-name]',
              should_escape: false
            },
            {
              command: '/mob',
              url: `http://${hostname}/slack/commands/mob`,
              description: 'Afficher des couples pilote/co-pilote à partir d\'une liste de participants',
              usage_hint: '[@quelqu\'un @quelqu\'une]',
              should_escape: false
            }
          ],
        },
        oauth_config: {
          scopes: {
            bot: [
              'commands',
              'incoming-webhook',
              'workflow.steps:execute'
            ]
          }
        },
        settings: {
          interactivity: {
            is_enabled: true,
            request_url: `http://${hostname}/build/slack/interactive-endpoint`
          },
          org_deploy_enabled: false,
          socket_mode_enabled: false,
          token_rotation_enabled: false
        }
      });
    });
  });
});
