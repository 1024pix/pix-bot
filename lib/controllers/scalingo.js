module.exports = {

  deploymentWebhook(request) {
    console.log(request.payload);
    return {};
  },

};
