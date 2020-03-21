const { deploy } = require('../releases');

module.exports = {

  deployRelease(payload) {
    return deploy(payload.text);
  }

};
