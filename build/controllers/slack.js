const github = require('../../common/services/github');

module.exports = {
  async getPullRequests(request) {
    const label = request.pre.payload.text;
    return github.getPullRequests(label);
  },
};
