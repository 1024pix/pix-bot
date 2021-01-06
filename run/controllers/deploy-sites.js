const githubServices = require('../../common/services/github');
const releasesService = require('../../run/services/releases');
const config = require('../../config');
const Boom = require('@hapi/boom');

const PIX_SITE_REPO_NAME = 'pix-site';
const PIX_SITE_APPS = ['pix-site', 'pix-pro'];

module.exports = {

  async deploySites(request) {
    const payload = request.payload;
    if (payload.secret !== config.prismic.secret) {
      throw Boom.unauthorized('Secret is missing or is incorrect');
    }

    const releaseTag = await githubServices.getLatestReleaseTag(PIX_SITE_REPO_NAME);
    await Promise.all(PIX_SITE_APPS.map((appName) => releasesService.deployPixRepo(PIX_SITE_REPO_NAME, appName, releaseTag)));

    return `pix.fr and pro.pix.fr deployments ${releaseTag} are in progress. Check deployment status on Scalingo`;
  },

};

