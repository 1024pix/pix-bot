class Manifest {
  constructor(name) {
    this.name = name;
    this.slashCommands = [];
    this.shortcuts = [];
  }

  registerSlashCommand(command) {
    this.slashCommands.push(command);
  }

  registerShortcut(shortcut) {
    this.shortcuts.push(shortcut);
  }

  getHapiRoutes() {
    return this.slashCommands.map(({ path, handler }) => {
      return {
        method: 'POST',
        path,
        handler,
      };
    });
  }
}

module.exports = {
  Manifest,
};
