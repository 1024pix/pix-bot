const commands = require('../services/slack/commands');
const shortcuts = require('../services/slack/shortcuts');

module.exports = {

   deployRelease(request, h) {
    const payload = request.pre.payload;

    commands.deployRelease(payload);

    return {
      "text": "Message bien reçu."
    };
  },

  interactiveEndpoint(request, h) {
    const payload = JSON.parse(request.payload.payload);

    shortcuts.openDeployReleaseVersionSelectionModal(payload);

    return {};
  },

};
