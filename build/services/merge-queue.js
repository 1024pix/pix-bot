import { config } from '../../config.js';

import * as pullRequestRepository from '../repositories/pull-request-repository.js';
import githubService from '../../common/services/github.js';
import { PullRequestNotFoundError } from '../repositories/pull-request-repository.js';
import { logger } from '../../common/services/logger.js';

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

    logger.info({
      event: 'current-merge-state',
      message: `Repository: ${repositoryName}; PR en attente : ${pr.length}; ordre à venir : ${pr.map(({ number }) => number).join(',')}`,
    });
    logger.info({
      event: 'dispatch-to-merge-action',
      message: `Déclenchement de l'action de merge pour la PR : ${nextMergingPr.repositoryName} #${nextMergingPr.number}`,
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
    if (!(await this.pullRequestIsManaged({ repositoryName, number }))) {
      return;
    }
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

  async pullRequestIsManaged({ repositoryName, number }) {
    try {
      await this.#pullRequestRepository.get({ repositoryName, number });
      return true;
    } catch (e) {
      if (e instanceof PullRequestNotFoundError) {
        return false;
      }
      throw e;
    }
  }
}

export const mergeQueue = new MergeQueue({ pullRequestRepository, githubService });
