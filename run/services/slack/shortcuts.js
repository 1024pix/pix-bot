import axios from 'axios';

import { config } from '../../../config.js';
import deployReleaseTagSelectionModal from './surfaces/modals/deploy-release/release-tag-selection.js';
import createAppOnScalingoModal from './surfaces/modals/scalingo-apps/application-creation.js';
import lockReleaseDeployment from './surfaces/modals/deploy-release/lock-release-deployment.js';

const openViewUrl = 'https://slack.com/api/views.open';

const shortcuts = {
  openViewDeployReleaseTagSelectionCallbackId: deployReleaseTagSelectionModal.callbackId,

  openViewCreateAppOnScalingoSelectionCallbackId: createAppOnScalingoModal.callbackId,

  openViewLockReleaseCallbackId: lockReleaseDeployment.callbackId,

  async openViewDeployReleaseTagSelection(payload) {
    const data = await deployReleaseTagSelectionModal.getView(payload.trigger_id);
    const options = {
      method: 'POST',
      url: openViewUrl,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data,
    };
    return axios(options);
  },

  openViewLockRelease(payload) {
    const options = {
      method: 'POST',
      url: openViewUrl,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data: lockReleaseDeployment.getView(payload.trigger_id),
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
      data: createAppOnScalingoModal.getView(payload.trigger_id),
    };
    return axios(options);
  },
};

export default shortcuts;
