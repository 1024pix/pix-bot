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

  addInteractivity(interactivity) {
    this.interactivity = interactivity;
  }

  getHapiRoutes() {
    return [
      ...this.slashCommands.map(({ path, handler }) => {
        return {
          method: 'POST',
          path,
          handler,
        };
      }),
      ...(this.interactivity ? [{
        method: 'POST',
        path: this.interactivity.path,
        handler: this.interactivity.handler
      }] : [])
    ];
  }
}

module.exports = {
  Manifest,
};
