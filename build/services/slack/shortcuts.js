import * as axios from 'axios';
import * as publishReleaseTypeSelectionModal from './surfaces/modals/publish-release/release-type-selection';
impor * as conf from '../../../config';

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

export { slackShortcuts };
