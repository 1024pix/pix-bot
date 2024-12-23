import { config } from '../../config.js';

import * as pullRequestRepository from '../repositories/pull-request-repository.js';
import githubService from '../../common/services/github.js';

export class MergeQueue {
  #pullRequestRepository;
  #githubService;

  constructor({ pullRequestRepository, githubService }) {
    this.#pullRequestRepository = pullRequestRepository;
    this.#githubService = githubService;
  }

  async manage({ repositoryName }) {
    const isAtLeastOneMergeInProgress = await this.#pullRequestRepository.isAtLeastOneMergeInProgress(repositoryName);
    if (isAtLeastOneMergeInProgress) {
      return;
    }

    const pr = await this.#pullRequestRepository.getOldest(repositoryName);
    if (!pr) {
      return;
    }

    await this.#pullRequestRepository.update({
      ...pr,
      isMerging: true,
    });
    await this.#githubService.triggerWorkflow({
      workflow: {
        id: config.github.automerge.workflowId,
        repositoryName: config.github.automerge.repositoryName,
        ref: config.github.automerge.workflowRef,
      },
      inputs: {
        pullRequest: `${pr.repositoryName}/${pr.number}`,
      },
    });
  }
}

export const mergeQueue = new MergeQueue({ pullRequestRepository, githubService });
