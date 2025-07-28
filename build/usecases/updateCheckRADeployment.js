import * as reviewAppRepo from '../repositories/review-app-repository.js';
import commonGithubService from '../../common/services/github.js';
import { logger } from '../../common/services/logger.js';

export async function updateCheckRADeployment(
  { repositoryName, pullRequestNumber },
  dependencies = { reviewAppRepo, githubService: commonGithubService },
) {
  const reviewApps = await dependencies.reviewAppRepo.listForPullRequest({
    repository: repositoryName,
    prNumber: pullRequestNumber,
  });

  const status = reviewApps.reduce((prevStatus, reviewApp) => {
    const statuses = [prevStatus, reviewApp.status];
    if (statuses.includes('failure')) return 'failure';
    if (statuses.includes('pending')) return 'pending';
    return 'success';
  }, 'success');

  logger.info({
    event: 'review-app-deploy',
    message: `Updating check ra status`,
    data: { repository: repositoryName, prNumber: pullRequestNumber, status },
  });

  await dependencies.githubService.addRADeploymentCheck({
    repository: repositoryName,
    prNumber: pullRequestNumber,
    status,
  });
}
