import * as pullRequestRepository from '../repositories/pull-request-repository.js';
import githubService from '../../common/services/github.js';
import { PullRequestNotFoundError } from '../repositories/pull-request-repository.js';

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
  #mergeService;

  constructor({ pullRequestRepository, pullRequestMergeService }) {
    this.#pullRequestRepository = pullRequestRepository;
    this.#mergeService = pullRequestMergeService;
  }

  async manage({ repositoryName }) {
    const isAtLeastOneMergeInProgress = await this.#pullRequestRepository.isAtLeastOneMergeInProgress(repositoryName);
    if (isAtLeastOneMergeInProgress) {
      return;
    }

    const prs = await this.#pullRequestRepository.findNotMerged(repositoryName);
    if (prs.length === 0) {
      return;
    }

    const { prsToMerge, prsNotReady } = await groupPrsByMergeStatus(prs, this.#mergeService);

    const nextMergingPr = prsToMerge.shift();
    await this.#mergeService.merge(nextMergingPr);
    await this.#pullRequestRepository.update({ ...nextMergingPr, isMerging: true });

    for (let i = 0; i < prsToMerge.length; i++) {
      await this.#mergeService.updateMergeQueuePosition({ ...prsToMerge[i], position: i + 1, total: prsToMerge.length +1 });
    }

    for (const pr of prsNotReady) {
      await this.#pullRequestRepository.delete(pr);
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

async function groupPrsByMergeStatus(prs, mergeService) {
  const prsToMerge = [];
  const prsNotReady = [];
  for (const pr of prs) {
    if (await mergeService.areMergeConditionsMet(pr)) {
      prsToMerge.push(pr);
    } else {
      prsNotReady.push(pr);
    }
  }
  return { prsToMerge, prsNotReady };
}

export const mergeQueue = new MergeQueue({ pullRequestRepository, githubService });
