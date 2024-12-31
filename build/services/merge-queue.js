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

    const pr = await this.#pullRequestRepository.findNotMerged(repositoryName);
    if (pr.length === 0) {
      return;
    }

    const nextMergingPr = pr[0];
    await this.#pullRequestRepository.update({
      ...nextMergingPr,
      isMerging: true,
    });
    await this.#githubService.triggerWorkflow({
      workflow: {
        id: config.github.automerge.workflowId,
        repositoryName: config.github.automerge.repositoryName,
        ref: config.github.automerge.workflowRef,
      },
      inputs: {
        pullRequest: `${nextMergingPr.repositoryName}/${nextMergingPr.number}`,
      },
    });
  }

  async managePullRequest({ repositoryName, number }) {
    await this.#pullRequestRepository.save({
      repositoryName,
      number,
    });
    await this.manage({ repositoryName });
  }

  async unmanagePullRequest({ repositoryName, number }) {
    await this.#pullRequestRepository.remove({
      repositoryName,
      number,
    });
    await this.manage({ repositoryName });
  }
}

export const mergeQueue = new MergeQueue({ pullRequestRepository, githubService });
