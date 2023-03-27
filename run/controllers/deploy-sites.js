const config = require('../../config');
const { deploy } = require('../services/deploy');
const githubServices = require('../../common/services/github');

const Boom = require('@hapi/boom');

module.exports = {
  async deploySites(request) {
    const payload = request.payload;
    if (payload.secret !== config.prismic.secret) {
      throw Boom.unauthorized('Secret is missing or is incorrect');
    }
    const repoName = config.PIX_SITE_REPO_NAME;
    const releaseTag = await githubServices.getLatestReleaseTag(repoName);
    await deploy(repoName, config.PIX_SITE_APPS, releaseTag);

    return `pix.fr and pro.pix.fr deployments ${releaseTag} are in progress. Check deployment status on Scalingo`;
  },
};
