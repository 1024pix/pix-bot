const config = require('../../config');
const { deploy } = require('../services/deploy');

const Boom = require('@hapi/boom');

module.exports = {

  async deploySites(request) {
    const payload = request.payload;
    if (payload.secret !== config.prismic.secret) {
      throw Boom.unauthorized('Secret is missing or is incorrect');
    }

    const releaseTag = await deploy(config.PIX_SITE_REPO_NAME, config.PIX_SITE_APPS);

    return `pix.fr and pro.pix.fr deployments ${releaseTag} are in progress. Check deployment status on Scalingo`;
  },

};

