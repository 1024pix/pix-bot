function registerSlashCommands(deployConfiguration, manifest) {
  deployConfiguration.forEach((configuration) => {
    manifest.registerSlashCommand({
      ...configuration.slashCommand,
      path: `/slack/commands${configuration.slashCommand.command}`,
      should_escape: false,
      handler: () => {
        configuration.deployFunction();
        return {
          text: configuration.slackReturnText,
        };
      },
    });
  });
}

export { registerSlashCommands };
