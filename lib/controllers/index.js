const { name, version, description } = require('../../package');

module.exports = {

  getApiInfo(request, h) {
    return {
      name, version, description
    };
  },

};