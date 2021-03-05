const { name, version, description } = require('../../package.json');

module.exports = {

  getApiInfo() {
    return {
      name, version, description
    };
  },

};