module.exports = {
  async get(request) {
    const protocol = request.headers['x-forwarded-proto'] ? request.headers['x-forwarded-proto'] : 'http';
    const { host } = request.info;
    const url = `${protocol}://${host}`;
    return {
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
            url: `${url}/slack/commands/pull-requests`,
            description: 'Afficher les PR à review de l\'application Pix',
            usage_hint: '[cross-team|team-acces|team-evaluation|team-certif|team-prescription]',
            should_escape: false
          },
          {
            command: '/tips-a11y',
            url: `${url}/slack/commands/accessibility-tip`,
            description: 'Je veux un tips sur l\'accessibilité !',
            should_escape: false
          },
          {
            command: '/changelog',
            url: `${url}/slack/commands/changelog`,
            description: 'Afficher le changelog depuis la dernière release',
            should_escape: false
          },
          {
            command: '/hotfix',
            url: `${url}/slack/commands/create-and-deploy-pix-hotfix`,
            description: 'Créer une version patch à partir d\'une branche et la déployer en recette',
            usage_hint: '[branch-name]',
            should_escape: false
          }
        ]
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
          request_url: `${url}/slack/interactive-endpoint`
        },
        org_deploy_enabled: false,
        socket_mode_enabled: false,
        token_rotation_enabled: false
      }
    };
  },
};

