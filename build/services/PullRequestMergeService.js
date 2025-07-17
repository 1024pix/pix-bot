import * as githubService from '../../common/services/github.js';

const BLOCKING_LABELS = [
  ':warning: Blocked',
  ':earth_africa: i18n needed',
  ':busts_in_silhouette: Panel Review Needed',
  'Development in progress',
  ':eyes: Design Review Needed',
  ':eyes: Func Review Needed',
  ':eyes: Tech Review Needed',
];

const MERGE_LABEL = ':rocket: Ready to Merge';

const MERGE_STATUS_DETAILS = {
  ABORTED: { description: 'Merge plus géré', checkStatus: 'success' },
  ERROR: { description: 'Error, merci de visiter la liste des essais', checkStatus: 'error' },
  MERGED: { description: '', checkStatus: 'success' },
};

export class PullRequestMergeService {
  constructor(dependencies = { githubService: githubService }) {
    this.githubService = dependencies.githubService;
  }

  async areMergeConditionsMet({ repositoryName, number }) {
    const prDetails = await this.githubService.getPullRequestDetails({ repositoryName, number });
    if (prDetails.labels.some((label) => BLOCKING_LABELS.includes(label))) {
      return false;
    }
    if (!prDetails.labels.includes(MERGE_LABEL)) {
      return false;
    }

    const isMergeable = await this.githubService.isMergeable({ repositoryName, number });
    if (!isMergeable) {
      return false;
    }

    return true;
  }

  async merge({ repositoryName, number }) {
    await this.updateBranch({ repositoryName, number });
    await this.githubService.enableAutoMerge({ number, repositoryName });
    await this.updateGitHubMergeQueueStatus({ repositoryName, number, text: 'En cours de merge' });
  }

  async updateMergeQueuePosition({ repositoryName, number, position, total }) {
    await this.updateGitHubMergeQueueStatus({
      repositoryName,
      number,
      text: `${position}/${total} dans la file d'attente`,
    });
  }

  async unmanage({ repositoryName, number, status }) {
    const statusDetails = MERGE_STATUS_DETAILS[status];
    await this.updateGitHubMergeQueueStatus({
      repositoryName,
      number,
      text: statusDetails.description,
      status: statusDetails.checkStatus,
    });
  }

  updateBranch({ repositoryName, number }) {
    this.githubService.updatePullRequestBranch({ number, repositoryName });
  }

  async updateGitHubMergeQueueStatus({ repositoryName, number, text, status = 'pending' }) {
    try {
      await this.githubService.setMergeQueueStatus({
        status,
        description: text,
        repositoryFullName: repositoryName,
        prNumber: number,
      });
    } catch (_) {
      //
    }
  }
}
