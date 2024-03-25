import axios from 'axios';

import conf from '../../../config.js';
import * as publishReleaseTypeSelectionModal from './surfaces/modals/publish-release/release-type-selection.js';

const slackShorcuts = {
  openViewPublishReleaseTypeSelectionCallbackId: publishReleaseTypeSelectionModal.callbackId,
  openViewPublishReleaseTypeSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${conf.slack.botToken}`,
      },
      data: publishReleaseTypeSelectionModal(payload.trigger_id),
    };
    return axios(options);
  },
};

export default slackShorcuts;
