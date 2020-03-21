const path = require('path');

module.exports =  {

  init(server) {
    const routesDir = path.join(__dirname, 'routes');
    require('fs').readdirSync(routesDir).forEach((file) => {
      server.route(require(path.join(routesDir, file)));
    });
  }
};
