const { deploy } = require('../services/releases');

module.exports = {

  test(request, h) {
    const payload = request.payload;

    console.log(payload);

    return {
      "response_type": "in_channel",
      "text": "It works!"
    };
  },

  async deployRelease(request, h) {
    const version = request.pre.payload.text;

    await deploy(version);

    return {
      "response_type": "in_channel",
      "text": "Release deployed 🚀!"
    };
  },

};
