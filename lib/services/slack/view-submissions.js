const axios = require('axios');

module.exports = {

  submitReleaseSelection(payload) {

    const options = {
      method: 'POST',
      url: payload.response_url,
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
      },
      data: {
        "text": "Thanks for your request, we'll process it and get back to you."
      }
    };
//    return axios(options);
    return true;
  }
};
