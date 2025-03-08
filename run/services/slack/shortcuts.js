import axios from 'axios';

import { config } from '../../../config.js';
import deployReleaseTagSelectionModal from './surfaces/modals/deploy-release/release-tag-selection.js';
import createAppOnScalingoModal from './surfaces/modals/scalingo-apps/application-creation.js';
import lockRelease from './surfaces/modals/deploy-release/lock-release-deployment.js';

const openViewUrl = 'https://slack.com/api/views.open';

const shortcuts = {
  openViewDeployReleaseTagSelectionCallbackId: deployReleaseTagSelectionModal.callbackId,

  openViewCreateAppOnScalingoSelectionCallbackId: createAppOnScalingoModal.callbackId,

  openViewLockReleaseCallbackId: lockRelease.callbackId,

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

  openViewLockRelease(payload) {
    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${config.slack.botToken}`,
    };
    return fetch(openViewUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(lockRelease.getView(payload.trigger_id)),
    });
  },
};

export default shortcuts;
