import Boom from '@hapi/boom';

import github from '../../common/services/github.js';
import { config } from '../../config.js';
import { deploy } from '../services/deploy.js';

const deploySites = {
  async deploySites(request) {
    const payload = request.payload;
    if (payload.secret !== config.prismic.secret) {
      throw Boom.unauthorized('Secret is missing or is incorrect');
    }
    const repoName = config.PIX_SITE_REPO_NAME;
    const releaseTag = await github.getLatestReleaseTag(repoName);
    await deploy(repoName, config.PIX_SITE_APPS, releaseTag);

    return `pix.fr and pro.pix.fr deployments ${releaseTag} are in progress. Check deployment status on Scalingo`;
  },
};

export default deploySites;
