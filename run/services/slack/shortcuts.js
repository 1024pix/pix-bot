const axios = require('axios');
const deployReleaseTagSelectionModal = require('./surfaces/modals/deploy-release/release-tag-selection');
const createAppOnScalingoModal = require('./surfaces/modals/scalingo-apps/application-creation');
const config = require('../../../config');
const openViewUrl = 'https://slack.com/api/views.open';

module.exports = {
  openViewDeployReleaseTagSelectionCallbackId: deployReleaseTagSelectionModal.callbackId,

  openViewCreateAppOnScalingoSelectionCallbackId: createAppOnScalingoModal.callbackId,

  openViewDeployReleaseTagSelection(payload) {
    const options = {
      method: 'POST',
      url: openViewUrl,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data: deployReleaseTagSelectionModal(payload.trigger_id),
    };
    return axios(options);
  },

  openViewCreateAppOnScalingoSelection(payload) {
    const options = {
      method: 'POST',
      url: openViewUrl,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data: createAppOnScalingoModal(payload.trigger_id),
    };
    return axios(options);
  },
};
