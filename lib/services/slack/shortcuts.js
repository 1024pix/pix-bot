const axios = require('axios');
const deployReleaseTagSelectionModal = require('./surfaces/modals/deploy-release/release-tag-selection');

module.exports = {

  openViewDeployReleaseTagSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      data: deployReleaseTagSelectionModal(payload.trigger_id)
    };
    return axios(options);
  }

};
