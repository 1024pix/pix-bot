function registerSlashCommands(deployConfiguration, manifest) {
  deployConfiguration.forEach((configuration) => {
    manifest.registerSlashCommand({
      ...configuration.slashCommand,
      path: `/slack/commands${configuration.slashCommand.command}`,
      should_escape: false,
      handler: (request) => {
        const payload = request?.pre?.payload;
        configuration.deployFunction(payload);
        return {
          text: configuration.slackReturnText,
        };
      },
    });
  });
}

module.exports = {
  registerSlashCommands,
};
