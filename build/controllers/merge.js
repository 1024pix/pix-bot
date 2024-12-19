import { mergeQueue } from '../services/merge-queue.js';
import * as pullRequestRepository from '../repositories/pull-request-repository.js';
import { config } from '../../config.js';
import Boom from '@hapi/boom';

const mergeController = {
  async handle(request, h, dependencies = { mergeQueue, pullRequestRepository }) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token !== config.authorizationToken) {
      throw Boom.unauthorized('Token is missing or is incorrect');
    }

    const { pullRequest } = request.payload;
    const [organisation, repository, pullRequestNumber] = pullRequest.split('/');
    const repositoryName = `${organisation}/${repository}`;
    await dependencies.pullRequestRepository.remove({ number: Number(pullRequestNumber), repositoryName });
    await dependencies.mergeQueue({ repositoryName });
    return h.response().code(204);
  },
};

export default mergeController;
