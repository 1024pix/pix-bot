const { name, version, description } = require('../../package');

module.exports = {

  getApiInfo() {
    return {
      name, version, description
    };
  },

};