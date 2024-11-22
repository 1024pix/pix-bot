import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import commonGithubService from '../../common/services/github.js';
import { logger } from '../../common/services/logger.js';
import ScalingoClient from '../../common/services/scalingo-client.js';
import { config } from '../../config.js';
import * as reviewAppRepo from '../repositories/review-app-repository.js';
import * as _pullRequestRepository from '../repositories/pull-request-repository.js';
import { mergeQueue as _mergeQueue } from '../services/merge-queue.js';

const repositoryToScalingoAppsReview = {
  'pix-api-data': ['pix-api-data-integration'],
  'pix-bot': ['pix-bot-review'],
  'pix-data': ['pix-airflow-review'],
  'pix-data-api-pix': ['pix-data-api-pix-integration'],
  'pix-db-replication': ['pix-datawarehouse-integration'],
  'pix-db-stats': ['pix-db-stats-review'],
  'pix-editor': ['pix-lcms-review'],
  'pix-epreuves': ['pix-epreuves-review'],
  'pix-exploit': ['pix-exploit-review'],
  'pix-site': ['pix-site-review', 'pix-pro-review'],
  'pix-tutos': ['pix-tutos-review'],
  'pix-ui': ['pix-ui-review'],
  pix: ['pix-api-review', 'pix-audit-logger-review', 'pix-front-review'],
  pix4pix: ['pix-4pix-front-review', 'pix-4pix-api-review'],
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

  const { shouldContinue, message } = _handleNoRACase(request);
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

async function _handleCloseRA(request, scalingoClient = ScalingoClient) {
  const payload = request.payload;
  const prId = payload.number;
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
    const reviewAppName = `${appName}-pr${prId}`;
    try {
      const reviewAppExists = await client.reviewAppExists(reviewAppName);
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
          pr: prId,
        },
      });
    }
  }
  const result = closedRA.map((ra) =>
    ra.isAlreadyClosed ? `${ra.name}-pr${prId} (already closed)` : `${ra.name}-pr${prId}`,
  );

  return `Closed RA for PR ${prId} : ${result.join(', ')}.`;
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

  if (deployedRA.length === 0) {
    throw new Error(`No RA deployed for repository ${repository} and pr${prId}`);
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
    pullRequestRepository = _pullRequestRepository,
    mergeQueue = _mergeQueue,
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
      await pullRequestRepository.remove({
        number: request.payload.number,
        repositoryName: request.payload.repository.full_name,
      });
      await mergeQueue();
      return handleCloseRA(request);
    }
    if (request.payload.action === 'labeled' && request.payload.label.name == 'no-review-app') {
      await handleCloseRA(request);
    }
    if (request.payload.action === 'labeled' && request.payload.label.name === ':rocket: Ready to Merge') {
      await pullRequestRepository.save({
        number: request.payload.number,
        repositoryName: request.payload.repository.full_name,
      });
      await mergeQueue();
    }
    if (request.payload.action === 'unlabeled' && request.payload.label.name === ':rocket: Ready to Merge') {
      await pullRequestRepository.remove({
        number: request.payload.number,
        repositoryName: request.payload.repository.full_name,
      });
      await mergeQueue();
    }
    return `Ignoring ${request.payload.action} action`;
  } else if (eventName === 'check_suite') {
    if (request.payload.action === 'completed' && request.payload.check_suite.conclusion !== 'success') {
      await pullRequestRepository.remove({
        number: request.payload.pull_requests[0].number,
        repositoryName: request.payload.repository.full_name,
      });
      await mergeQueue();
    }
  } else {
    return `Ignoring ${eventName} event`;
  }
}

function _handleNoRACase(request) {
  const payload = request.payload;
  const repository = payload.pull_request.head.repo.name;
  const reviewApps = repositoryToScalingoAppsReview[repository];
  const isFork = payload.pull_request.head.repo.fork;
  const labelsList = payload.pull_request.labels;
  const state = payload.pull_request.state;

  if (isFork) {
    return { message: 'No RA for a fork', shouldContinue: false };
  }
  if (!reviewApps) {
    return { message: 'No RA configured for this repository', shouldContinue: false };
  }
  if (labelsList.some((label) => label.name == 'no-review-app')) {
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
