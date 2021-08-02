const config = require('../../config');
const { deploy } = require('../services/deploy');

const Boom = require('@hapi/boom');

const PIX_SITE_REPO_NAME = 'pix-site';
const PIX_SITE_APPS = ['pix-site', 'pix-pro'];

module.exports = {

  async deploySites(request) {
    const payload = request.payload;
    if (payload.secret !== config.prismic.secret) {
      throw Boom.unauthorized('Secret is missing or is incorrect');
    }

    const releaseTag = await deploy(PIX_SITE_REPO_NAME, PIX_SITE_APPS);

    return `pix.fr and pro.pix.fr deployments ${releaseTag} are in progress. Check deployment status on Scalingo`;
  },

};

