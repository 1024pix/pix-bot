const axios = require('axios');
const publishReleaseTypeSelectionModal = require('./surfaces/modals/publish-release/release-type-selection');
const deployReleaseTagSelectionModal = require('./surfaces/modals/deploy-release/release-tag-selection');
const config = require('../../config');

module.exports = {

  openViewPublishReleaseTypeSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${config.slack.botToken}`
      },
      data: publishReleaseTypeSelectionModal(payload.trigger_id)
    };
    return axios(options);
  },

  openViewDeployReleaseTagSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${config.slack.botToken}`
      },
      data: deployReleaseTagSelectionModal(payload.trigger_id)
    };
    return axios(options);
  }

};
