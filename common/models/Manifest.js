class Manifest {
  constructor(name) {
    this.name = name;
    this.slashCommands = [];
  }

  registerSlashCommand(command) {
    this.slashCommands.push(command);
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
