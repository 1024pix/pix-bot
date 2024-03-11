import axios from 'axios';

import { config } from '../../../config.js';
import publishReleaseTypeSelectionModal from './surfaces/modals/publish-release/release-type-selection.js';

const slackShorcuts = {
  openViewPublishReleaseTypeSelectionCallbackId: publishReleaseTypeSelectionModal.callbackId,
  openViewPublishReleaseTypeSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data: publishReleaseTypeSelectionModal.getView(payload.trigger_id),
    };
    return axios(options);
  },
};

export default slackShorcuts;
