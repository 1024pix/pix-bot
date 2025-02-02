import { MERGE_STATUS, mergeQueue } from '../services/merge-queue.js';
import { config } from '../../config.js';
import Boom from '@hapi/boom';

const mergeController = {
  async handle(request, h, dependencies = { mergeQueue }) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token !== config.authorizationToken) {
      throw Boom.unauthorized('Token is missing or is incorrect');
    }

    const { pullRequest } = request.payload;
    const [organisation, repository, pullRequestNumber] = pullRequest.split('/');
    const repositoryName = `${organisation}/${repository}`;
    await dependencies.mergeQueue.unmanagePullRequest({
      repositoryName,
      number: Number(pullRequestNumber),
      status: MERGE_STATUS.ERROR,
    });
    return h.response().code(204);
  },
};

export default mergeController;
