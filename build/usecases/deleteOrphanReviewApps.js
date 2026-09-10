import commonGithubService from '../../common/services/github.js';
import { logger } from '../../common/services/logger.js';
import ScalingoClient from '../../common/services/scalingo-client.js';
import { config } from '../../config.js';
import { repositoryToScalingoAppsReview } from '../controllers/github.js';
import * as reviewAppRepo from '../repositories/review-app-repository.js';

const event = 'orphan-review-apps';
const REVIEW_APP_NAME = /^(?<parentApp>.+)-pr(?<pullRequestNumber>\d+)$/;

function _buildParentAppToRepository(repositoryToApps) {
  const parentAppToRepository = {};
  for (const [repository, reviewApps] of Object.entries(repositoryToApps)) {
    for (const { appName } of reviewApps) {
      parentAppToRepository[appName] = repository;
    }
  }
  return parentAppToRepository;
}

/**
 * Deletes the review apps whose pull request is closed.
 *
 * The deletion triggered by the `pull_request.closed` webhook can fail (Scalingo outage, rate
 * limiting, missed delivery). Nothing replays it, so the review app keeps running - and keeps
 * being billed - forever. This safety net reconciles the review apps actually running on
 * Scalingo with the state of their pull request on GitHub.
 *
 * A review app is deleted only when all of these hold:
 * - its name matches `<parentApp>-pr<number>`;
 * - its parent app is one Pix Bot manages;
 * - GitHub answers, and answers that the pull request is closed.
 *
 * Any doubt (unknown parent app, unreachable pull request, GitHub error) leaves the app alone.
 */
async function deleteOrphanReviewApps(
  { dryRun = config.orphanReviewApps.dryRun, maxDeletions = config.orphanReviewApps.maxDeletionsPerRun } = {},
  dependencies = {
    scalingoClient: ScalingoClient,
    github: commonGithubService,
    reviewAppRepo,
    repositoryToScalingoAppsReview,
  },
) {
  const parentAppToRepository = _buildParentAppToRepository(dependencies.repositoryToScalingoAppsReview);
  const client = await dependencies.scalingoClient.getInstance('reviewApps');
  const reviewAppNames = await client.getReviewAppsList();

  const orphans = [];
  for (const reviewAppName of reviewAppNames) {
    const groups = REVIEW_APP_NAME.exec(reviewAppName)?.groups;
    if (!groups) continue;

    const repository = parentAppToRepository[groups.parentApp];
    if (!repository) {
      logger.info({
        event,
        message: `Ignoring ${reviewAppName}: parent application ${groups.parentApp} is not managed by Pix Bot.`,
      });
      continue;
    }

    const pullRequestNumber = Number(groups.pullRequestNumber);
    let pullRequest;
    try {
      pullRequest = await dependencies.github.getPullRequestState({ repositoryName: repository, pullRequestNumber });
    } catch (error) {
      logger.error({
        event,
        message: `Could not read the state of ${repository}#${pullRequestNumber}, keeping ${reviewAppName}: ${error.message}`,
      });
      continue;
    }

    if (!pullRequest || pullRequest.state !== 'closed') continue;
    orphans.push({ reviewAppName, repository, pullRequestNumber, isMerged: pullRequest.isMerged });
  }

  const toDelete = orphans.slice(0, maxDeletions);
  if (orphans.length > toDelete.length) {
    logger.warn({
      event,
      message: `Found ${orphans.length} orphan review apps but only deleting ${toDelete.length} this run (maxDeletions: ${maxDeletions}).`,
    });
  }

  const deleted = [];
  for (const { reviewAppName, repository, pullRequestNumber, isMerged } of toDelete) {
    const closedAs = isMerged ? 'merged' : 'closed';
    if (dryRun) {
      logger.info({
        event,
        message: `[dry run] ${reviewAppName} would be deleted (${repository}#${pullRequestNumber} is ${closedAs}).`,
      });
      continue;
    }
    try {
      await client.deleteReviewApp(reviewAppName);
      await dependencies.reviewAppRepo.remove({ name: reviewAppName });
      deleted.push(reviewAppName);
      logger.info({
        event,
        message: `Deleted orphan review app ${reviewAppName} (${repository}#${pullRequestNumber} is ${closedAs}).`,
      });
    } catch (error) {
      logger.error({
        event,
        message: `Deletion of orphan review app ${reviewAppName} failed: ${error.message}`,
        stack: error.stack,
      });
    }
  }

  logger.info({
    event,
    message: `Reviewed ${reviewAppNames.length} review apps, found ${orphans.length} orphan(s), deleted ${deleted.length}.`,
  });

  return { reviewed: reviewAppNames.length, orphans: orphans.map(({ reviewAppName }) => reviewAppName), deleted };
}

export { deleteOrphanReviewApps };
