import { config } from '../../config.js';

const GITHUB_WORKFLOW_DISPATCH_URL = `https://api.github.com/repos/${config.github.automerge.repositoryName}/actions/workflows/${config.github.automerge.workflowId}/dispatches`;
const GITHUB_WORKFLOW_REF = 'main';

import * as _pullRequestRepository from '../repositories/pull-request-repository.js';
import { httpAgent as _httpAgent } from '../../common/http-agent.js';

export async function mergeQueue({ pullRequestRepository = _pullRequestRepository, httpAgent = _httpAgent } = {}) {
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
  await httpAgent.post({
    url: GITHUB_WORKFLOW_DISPATCH_URL,
    payload: {
      ref: GITHUB_WORKFLOW_REF,
      inputs: {
        pullRequest: `${pr.repositoryName}/${pr.number}`,
      },
    },
  });
}
