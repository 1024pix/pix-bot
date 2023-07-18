function registerSlashCommands(deployConfiguration, manifest) {
  deployConfiguration.forEach((configuration) => {
    manifest.registerSlashCommand({
      ...configuration.slashCommand,
      path: `/slack/commands${configuration.slashCommand.command}`,
      should_escape: false,
      handler: () => {
        return {
          text: configuration.slashCommand.slackReturnText,
        };
      },
    });
  });
}

module.exports = {
  registerSlashCommands,
};
