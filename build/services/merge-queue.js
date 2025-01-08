import { config } from '../../config.js';

import * as pullRequestRepository from '../repositories/pull-request-repository.js';
import githubService from '../../common/services/github.js';

export const MERGE_STATUS = {
  ABORTED: 'ABORTED',
  ERROR: 'ERROR',
  MERGED: 'MERGED',
};

export const MERGE_STATUS_DETAILS = {
  ABORTED: { description: 'Merge plus géré', checkStatus: 'success' },
  ERROR: { description: 'Error, merci de visiter la liste des essais', checkStatus: 'error' },
  MERGED: { description: '', checkStatus: 'success' },
};

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

    await this.#githubService.setMergeQueueStatus({
      status: 'pending',
      description: 'En cours de merge',
      repositoryFullName: repositoryName,
      prNumber: pr[0].number,
    });

    for (let i = 1; i < pr.length; i++) {
      await this.#githubService.setMergeQueueStatus({
        status: 'pending',
        description: `${i + 1}/${pr.length} dans la file d'attente`,
        repositoryFullName: repositoryName,
        prNumber: pr[i].number,
      });
    }
  }

  async managePullRequest({ repositoryName, number }) {
    await this.#pullRequestRepository.save({
      repositoryName,
      number,
    });
    await this.manage({ repositoryName });
  }

  async unmanagePullRequest({ repositoryName, number, status }) {
    const statusDetails = MERGE_STATUS_DETAILS[status];
    await this.#githubService.setMergeQueueStatus({
      status: statusDetails.checkStatus,
      description: statusDetails.description,
      repositoryFullName: repositoryName,
      prNumber: number,
    });

    await this.#pullRequestRepository.remove({
      repositoryName,
      number,
    });
    await this.manage({ repositoryName });
  }
}

export const mergeQueue = new MergeQueue({ pullRequestRepository, githubService });
