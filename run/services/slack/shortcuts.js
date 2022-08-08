const axios = require('axios');
const deployReleaseTagSelectionModal = require('./surfaces/modals/deploy-release/release-tag-selection');
const config = require('../../../config');

module.exports = {
  openViewDeployReleaseTagSelectionCallbackId: deployReleaseTagSelectionModal.callbackId,

  openViewDeployReleaseTagSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data: deployReleaseTagSelectionModal(payload.trigger_id),
    };
    return axios(options);
  },
};
