const { slackConfig } = require('../../common/config');
const manifest = require('../manifest');

module.exports = manifest
  .getHapiRoutes()
  .map((route) => {
    return {
      ...route,
      config: slackConfig,
    };
  });
