import { config } from '../../config.js';

const GITHUB_WORKFLOW_DISPATCH_URL = `https://api.github.com/repos/${config.github.automerge.repositoryName}/actions/workflows/${config.github.automerge.workflowId}/dispatches`;
const GITHUB_WORKFLOW_REF = 'main';

export async function mergeQueue({ pullRequestRepository, httpAgent }) {
  const isCurrentlyMerging = await pullRequestRepository.isCurrentlyMerging();
  if (isCurrentlyMerging) {
    return;
  }

  const pr = await pullRequestRepository.getOldest();
  await pullRequestRepository.update({
    ...pr,
    isCurrentlyMerging: true,
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
