import { config } from '../../config.js';

import * as _pullRequestRepository from '../repositories/pull-request-repository.js';
import _githubService from '../../common/services/github.js';

export async function mergeQueue({
  pullRequestRepository = _pullRequestRepository,
  githubService = _githubService,
} = {}) {
  const isAtLeastOneMergeInProgress = await pullRequestRepository.isAtLeastOneMergeInProgress();
  if (isAtLeastOneMergeInProgress) {
    return;
  }

  const pr = await pullRequestRepository.getOldest();
  if (!pr) {
    return;
  }

  await pullRequestRepository.update({
    ...pr,
    isMerging: true,
  });
  await githubService.triggerWorkflow({
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
