const manifest = require('../manifest');

module.exports = {
  async get(request) {
    const protocol = request.headers['x-forwarded-proto'] ? request.headers['x-forwarded-proto'] : 'http';
    const { host } = request.info;
    const url = `${protocol}://${host}`;
    return {
      display_information: {
        name: manifest.name
      },
      features: {
        bot_user: {
          display_name: manifest.name,
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
        slash_commands: manifest.slashCommands.map(({ command, path, description, usage_hint, should_escape }) => {
          return {
            command,
            url: `${url}${path}`,
            description,
            usage_hint,
            should_escape,
          };
        })
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
          request_url: `${url}/build/slack/interactive-endpoint`
        },
        org_deploy_enabled: false,
        socket_mode_enabled: false,
        token_rotation_enabled: false
      }
    };
  },
};

