const axios = require('axios');
const deployReleaseNumberSelectionModal = require('./surfaces/modals/deploy-release/release-number-selection');

module.exports = {

  openViewDeployReleaseNumberSelection(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      data: deployReleaseNumberSelectionModal(payload.trigger_id)
    };
    return axios(options);
  }

};
