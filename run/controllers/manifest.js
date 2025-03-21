import manifest from '../manifest.js';

const manifestRequest = {
  async get(request) {
    const protocol = request.headers['x-forwarded-proto'] ? request.headers['x-forwarded-proto'] : 'http';
    const { host } = request.info;
    const url = `${protocol}://${host}`;
    return {
      display_information: {
        name: manifest.name,
      },
      features: {
        bot_user: {
          display_name: manifest.name,
          always_online: false,
        },
        shortcuts: manifest.shortcuts,
        slash_commands: manifest.slashCommands.map(({ command, path, description, usage_hint, should_escape }) => {
          const commandObject = {
            command,
            url: `${url}${path}`,
            description,
            should_escape,
          };
          if (usage_hint) {
            commandObject.usage_hint = usage_hint;
          }
          return commandObject;
        }),
      },
      oauth_config: {
        scopes: {
          bot: ['commands', 'incoming-webhook', 'chat:write'],
        },
      },
      settings: {
        interactivity: manifest.interactivity
          ? {
              is_enabled: true,
              request_url: `${url}${manifest.interactivity.path}`,
            }
          : null,
        org_deploy_enabled: false,
        socket_mode_enabled: false,
        token_rotation_enabled: false,
      },
    };
  },
};

export default manifestRequest;
