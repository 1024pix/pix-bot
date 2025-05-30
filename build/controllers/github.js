import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import commonGithubService from '../../common/services/github.js';
import { logger } from '../../common/services/logger.js';
import ScalingoClient from '../../common/services/scalingo-client.js';
import { config } from '../../config.js';
import * as reviewAppRepo from '../repositories/review-app-repository.js';
import { MERGE_STATUS, mergeQueue as _mergeQueue } from '../services/merge-queue.js';

const repositoryToScalingoAppsReview = {
  'pix-api-data': ['pix-api-data-integration'],
  'pix-bot': ['pix-bot-review'],
  'pix-data': ['pix-airflow-review'],
  'pix-api-to-pg': ['pix-data-api-pix-integration'],
  'pix-db-replication': ['pix-datawarehouse-integration'],
  'pix-db-stats': ['pix-db-stats-review'],
  'pix-editor': ['pix-lcms-review'],
  'pix-epreuves': ['pix-epreuves-review'],
  'pix-exploit': ['pix-exploit-review'],
  'pix-site': ['pix-site-review', 'pix-pro-review'],
  'pix-tutos': ['pix-tutos-review'],
  'pix-ui': ['pix-ui-review'],
  pix: ['pix-api-review', 'pix-api-maddo-review', 'pix-audit-logger-review', 'pix-front-review'],
  pix4pix: ['pix-4pix-front-review', 'pix-4pix-api-review'],
  securix: ['pix-securix-review'],
};

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function getMessageTemplate(repositoryName) {
  const baseDir = path.join(__dirname, '..', 'templates', 'pull-request-messages');
  let relativeFileName;
  if (fs.existsSync(path.join(baseDir, `${repositoryName}.md`))) {
    relativeFileName = `${repositoryName}.md`;
  } else {
    relativeFileName = 'default.md';
  }

  const messageTemplate = fs.readFileSync(path.join(baseDir, relativeFileName), 'utf8');
  return messageTemplate;
}

function getMessage(repositoryName, pullRequestId, scalingoReviewApps, messageTemplate) {
  const scalingoDashboardUrl = `https://dashboard.scalingo.com/apps/osc-fr1/${scalingoReviewApps[0]}-pr${pullRequestId}/environment`;
  const shortenedRepositoryName = repositoryName.replace('pix-', '');
  const webApplicationUrl = `https://${shortenedRepositoryName}-pr${pullRequestId}.review.pix.fr`;
  const message = messageTemplate
    .replaceAll('{{pullRequestId}}', pullRequestId)
    .replaceAll('{{webApplicationUrl}}', webApplicationUrl)
    .replaceAll('{{scalingoDashboardUrl}}', scalingoDashboardUrl);
  return message;
}

const _addMessageToPullRequest = async ({ repositoryName, pullRequestId, scalingoReviewApps }, { githubService }) => {
  const messageTemplate = getMessageTemplate(repositoryName);
  const message = getMessage(repositoryName, pullRequestId, scalingoReviewApps, messageTemplate);

  await githubService.commentPullRequest({
    repositoryName,
    pullRequestId,
    comment: message,
  });
};

async function _handleRA(
  request,
  scalingoClient = ScalingoClient,
  addMessageToPullRequest = _addMessageToPullRequest,
  githubService = commonGithubService,
  reviewAppRepository = reviewAppRepo,
) {
  const payload = request.payload;
  const prId = payload.number;
  const ref = payload.pull_request.head.ref;
  const repository = payload.pull_request.head.repo.name;
  const reviewApps = repositoryToScalingoAppsReview[repository];

  const { shouldContinue, message } = await _handleNoRACase(request, githubService);
  if (!shouldContinue) {
    return message;
  }

  const deployedRA = await deployPullRequest(
    scalingoClient,
    reviewApps,
    prId,
    ref,
    repository,
    addMessageToPullRequest,
    githubService,
    reviewAppRepository,
  );

  return `Triggered deployment of RA on app ${deployedRA.join(', ')} with pr ${prId}`;
}

async function _handleCloseRA(
  request,
  scalingoClient = ScalingoClient,
  reviewAppRepository = reviewAppRepo,
  githubService = commonGithubService,
) {
  const payload = request.payload;
  const prNumber = payload.number;
  const repository = payload.pull_request.head.repo.name;
  const reviewApps = repositoryToScalingoAppsReview[repository];

  if (!reviewApps) {
    return `${repository} is not managed by Pix Bot.`;
  }

  let client;
  const closedRA = [];

  try {
    client = await scalingoClient.getInstance('reviewApps');
  } catch (error) {
    throw new Error(`Scalingo auth APIError: ${error.message}`);
  }

  for (const appName of reviewApps) {
    const reviewAppName = `${appName}-pr${prNumber}`;
    try {
      const reviewAppExists = await client.reviewAppExists(reviewAppName);
      // we remove the review app in any case
      await reviewAppRepository.remove({ name: reviewAppName });
      if (reviewAppExists) {
        await client.deleteReviewApp(reviewAppName);
        closedRA.push({ name: appName, isClosed: true, isAlreadyClosed: false });
      } else {
        closedRA.push({ name: appName, isClosed: false, isAlreadyClosed: true });
      }
    } catch (error) {
      logger.error({
        event: 'review-app',
        stack: error.stack,
        message: `Deletion of application ${reviewAppName} failed : ${error.message}`,
        data: {
          repository,
          reviewApp: reviewAppName,
          pr: prNumber,
        },
      });
    }
  }
  const result = closedRA.map((ra) =>
    ra.isAlreadyClosed ? `${ra.name}-pr${prNumber} (already closed)` : `${ra.name}-pr${prNumber}`,
  );
  const areAllDeployed = await reviewAppRepository.areAllDeployed({ repository, prNumber });
  if (areAllDeployed) {
    await githubService.addRADeploymentCheck({ repository, prNumber, status: 'success' });
  }

  return `Closed RA for PR ${prNumber} : ${result.join(', ')}.`;
}

async function deployPullRequest(
  scalingoClient,
  reviewApps,
  prId,
  ref,
  repository,
  addMessageToPullRequest,
  githubService,
  reviewAppRepository,
) {
  const deployedRA = [];
  let client;
  try {
    client = await scalingoClient.getInstance('reviewApps');
  } catch (error) {
    throw new Error(`Scalingo auth APIError: ${error.message}`);
  }
  for (const appName of reviewApps) {
    const reviewAppName = `${appName}-pr${prId}`;
    try {
      const reviewAppExists = await client.reviewAppExists(reviewAppName);
      if (reviewAppExists) {
        await client.deployUsingSCM(reviewAppName, ref);
      } else {
        await reviewAppRepository.create({ name: reviewAppName, repository, prNumber: prId, parentApp: appName });
        await client.deployReviewApp(appName, prId);
        await client.disableAutoDeploy(reviewAppName);
        await client.deployUsingSCM(reviewAppName, ref);
      }
      deployedRA.push({ name: appName, isCreated: !reviewAppExists });
    } catch (error) {
      logger.error({
        event: 'review-app',
        stack: error.stack,
        message: `Deployement for application ${reviewAppName} failed : ${error.message}`,
        data: {
          repository,
          reviewApp: reviewAppName,
          pr: prId,
          ref,
        },
      });
    }
  }

  await githubService.addRADeploymentCheck({ repository, prNumber: prId, status: 'pending' });

  if (deployedRA.some(({ isCreated }) => isCreated)) {
    await addMessageToPullRequest(
      {
        repositoryName: repository,
        scalingoReviewApps: reviewApps,
        pullRequestId: prId,
      },
      { githubService },
    );

    logger.info({
      event: 'review-app',
      message: `Created RA for repo ${repository} PR ${prId}`,
    });
  }

  if (deployedRA.length !== reviewApps.length) {
    throw new Error(`Some RA have not been deployed for repository ${repository} and pr${prId}`);
  }

  logger.info({
    event: 'review-app',
    message: `PR${prId} deployement triggered on RA for repo ${repository}`,
  });
  return deployedRA.map(({ name }) => name);
}

async function _pushOnDefaultBranchWebhook(request, scalingoClient = ScalingoClient) {
  const branchName = request.payload.ref.split('/').slice(-1)[0];
  if (request.payload.repository.default_branch != branchName) {
    return `Ignoring push event on branch ${branchName} as it is not the default branch`;
  }

  const repositoryName = request.payload.repository.name;

  if (!(repositoryName in config.scalingo.repositoryToScalingoIntegration)) {
    return `Ignoring push event on repository ${repositoryName} as it is not configured`;
  }
  const scalingoApps = config.scalingo.repositoryToScalingoIntegration[repositoryName];
  const client = await scalingoClient.getInstance('integration');
  for (const applicationName of scalingoApps) {
    try {
      await client.deployFromArchive(applicationName, branchName, repositoryName, { withEnvSuffix: false });
    } catch (error) {
      throw new Error(`Error during Scalingo deployment of application ${applicationName} : ${error.message}`);
    }
  }

  return `Deploying branch ${branchName} on integration applications : ` + scalingoApps.join(', ');
}

async function processWebhook(
  request,
  {
    pushOnDefaultBranchWebhook = _pushOnDefaultBranchWebhook,
    handleRA = _handleRA,
    handleCloseRA = _handleCloseRA,
    mergeQueue = _mergeQueue,
    githubService = commonGithubService,
  } = {},
) {
  const eventName = request.headers['x-github-event'];
  if (eventName === 'push') {
    return pushOnDefaultBranchWebhook(request);
  } else if (eventName === 'pull_request') {
    if (['opened', 'reopened', 'synchronize'].includes(request.payload.action)) {
      return handleRA(request);
    }
    if (request.payload.action === 'closed') {
      const repositoryName = request.payload.repository.full_name;
      const isMerged = request.payload.pull_request.merged;
      const status = isMerged ? MERGE_STATUS.MERGED : MERGE_STATUS.ABORTED;
      await mergeQueue.unmanagePullRequest({ repositoryName, number: request.payload.number, status });
      return handleCloseRA(request);
    }
    if (request.payload.action === 'labeled' && request.payload.label.name === 'no-review-app') {
      await handleCloseRA(request);
    }
    if (request.payload.action === 'labeled' && request.payload.label.name === ':rocket: Ready to Merge') {
      const belongsToPix = await githubService.checkUserBelongsToPix(request.payload.sender.login);
      if (!belongsToPix) {
        return `Ignoring ${request.payload.sender.login} label action`;
      }
      const repositoryName = request.payload.repository.full_name;
      const isAllowedRepository = config.github.automerge.allowedRepositories.includes(repositoryName);
      if (isAllowedRepository) {
        await mergeQueue.managePullRequest({ repositoryName, number: request.payload.number });
      }
    }
    if (request.payload.action === 'unlabeled' && request.payload.label.name === ':rocket: Ready to Merge') {
      const repositoryName = request.payload.repository.full_name;
      await mergeQueue.unmanagePullRequest({
        repositoryName,
        number: request.payload.number,
        status: MERGE_STATUS.ABORTED,
      });
    }
    return `Ignoring ${request.payload.action} action`;
  } else if (eventName === 'check_suite') {
    if (request.payload.action === 'completed') {
      const repositoryName = request.payload.repository.full_name;

      if (request.payload.check_suite.pull_requests.length === 0) {
        return `check_suite is not related to any pull_request`;
      }

      const prNumber = request.payload.check_suite.pull_requests[0].number;
      if (request.payload.check_suite.conclusion !== 'success') {
        await mergeQueue.unmanagePullRequest({ repositoryName, number: prNumber, status: MERGE_STATUS.ABORTED });
      } else {
        const hasReadyToMergeLabel = await githubService.isPrLabelledWith({
          repositoryName,
          number: prNumber,
          label: ':rocket: Ready to Merge',
        });
        if (hasReadyToMergeLabel) {
          await mergeQueue.managePullRequest({ repositoryName, number: prNumber });
        }
      }
      return `check_suite event handle`;
    }
    return `Ignoring '${request.payload.action}' action for check_suite event`;
  } else {
    return `Ignoring ${eventName} event`;
  }
}

async function _handleNoRACase(request, githubService) {
  const payload = request.payload;
  const repository = payload.pull_request.head.repo.name;
  const reviewApps = repositoryToScalingoAppsReview[repository];
  const isFork = payload.pull_request.head.repo.fork;
  const labelsList = payload.pull_request.labels;
  const state = payload.pull_request.state;
  const prNumber = payload.number;

  if (isFork) {
    return { message: 'No RA for a fork', shouldContinue: false };
  }
  if (!reviewApps) {
    return { message: 'No RA configured for this repository', shouldContinue: false };
  }
  if (labelsList.some((label) => label.name === 'no-review-app')) {
    await githubService.addRADeploymentCheck({ repository, prNumber, status: 'success' });
    return { message: 'RA disabled for this PR', shouldContinue: false };
  }
  if (state !== 'open') {
    return { message: 'No RA for closed PR', shouldContinue: false };
  }

  return { shouldContinue: true };
}

export {
  _addMessageToPullRequest as addMessageToPullRequest,
  getMessage,
  getMessageTemplate,
  _handleRA as handleRA,
  processWebhook,
  _pushOnDefaultBranchWebhook as pushOnDefaultBranchWebhook,
  _handleCloseRA as handleCloseRA,
};
