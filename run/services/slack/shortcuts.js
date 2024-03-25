import axios from 'axios';
import * as deployReleaseTagSelectionModal from './surfaces/modals/deploy-release/release-tag-selection.js';
import * as createAppOnScalingoModal from './surfaces/modals/scalingo-apps/application-creation.js';
import config from '../../../config.js';

const openViewUrl = 'https://slack.com/api/views.open';

const shortcuts = {
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

export default shortcuts;
