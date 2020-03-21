const axios = require('axios');
const deployReleaseVersionSelectionModal = require('./surfaces/modals/deploy-release/version-selection');

module.exports = {

  openDeployReleaseVersionSelectionModal(payload) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/views.open',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      data: deployReleaseVersionSelectionModal(payload.trigger_id)
    };
    return axios(options);
  }

};
