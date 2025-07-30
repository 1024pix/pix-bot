import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import commonGithubService from '../../common/services/github.js';
import { logger } from '../../common/services/logger.js';
import ScalingoClient from '../../common/services/scalingo-client.js';
import { config } from '../../config.js';
import * as reviewAppRepo from '../repositories/review-app-repository.js';
import { MERGE_STATUS, mergeQueue as _mergeQueue } from '../services/merge-queue.js';
import { updateCheckRADeployment } from '../usecases/updateCheckRADeployment.js';

const repositoryToScalingoAppsReview = {
  'pix-bot': [{ appName: 'pix-bot-review' }],
  'pix-data': [{ appName: 'pix-airflow-review', label: 'Airflow' }],
  'pix-api-to-pg': [{ appName: 'pix-data-api-pix-integration' }],
  'pix-db-replication': [{ appName: 'pix-datawarehouse-review' }],
  'pix-db-stats': [{ appName: 'pix-db-stats-review' }],
  'pix-editor': [{ appName: 'pix-lcms-review' }],
  'pix-epreuves': [
    {
      appName: 'pix-epreuves-review',
      getLinks: (pullRequestNumber) => [
        { label: 'Viewer', href: `https://epreuves-viewer.pix.digital/pr${pullRequestNumber}/` },
        {
          label: 'Viewer de composants',
          href: `https://epreuves-viewer.pix.digital/pr${pullRequestNumber}/components/`,
        },
        { label: 'Ancien viewer', href: `https://epreuves-pr${pullRequestNumber}.review.pix.fr/viewer.html` },
      ],
    },
  ],
  'pix-exploit': [{ appName: 'pix-exploit-review' }],
  'pix-nina': [{ appName: 'pix-nina-review' }],
  'pix-site': [
    {
      appName: 'pix-site-review',
      getLinks: (pullRequestNumber) => [
        { label: 'Pix Site (.fr)', href: `https://site-pr${pullRequestNumber}.review.pix.fr` },
        { label: 'Pix Site (.org)', href: `https://site-pr${pullRequestNumber}.review.pix.fr` },
      ],
    },
    {
      appName: 'pix-pro-review',
      getLinks: (pullRequestNumber) => [
        { label: 'Pix Pro (.fr)', href: `https://pro-pr${pullRequestNumber}.review.pix.fr` },
        { label: 'Pix Pro (.org)', href: `https://pro-pr${pullRequestNumber}.review.pix.fr` },
      ],
    },
  ],
  'pix-tutos': [{ appName: 'pix-tutos-review' }],
  'pix-ui': [{ appName: 'pix-ui-review' }],
  pix4pix: [
    { appName: 'pix-4pix-front-review', label: 'Fronts' },
    { appName: 'pix-4pix-api-review', label: 'API' },
  ],
  securix: [{ app: 'pix-securix-review' }],
  pix: [
    {
      appName: 'pix-api-review',
      getLinks: (pullRequestNumber) => [
        { label: 'API', href: `https://api-pr${pullRequestNumber}.review.pix.fr/api/` },
      ],
    },
    { appName: 'pix-front-review', isHidden: true },
    {
      appName: 'pix-app-review',
      getLinks: (pullRequestNumber) => [
        { label: 'App (.fr)', href: `https://app-pr${pullRequestNumber}.review.pix.fr` },
        { label: 'App (.org)', href: `https://app-pr${pullRequestNumber}.review.pix.org` },
      ],
    },
    {
      appName: 'pix-orga-review',
      getLinks: (pullRequestNumber) => [
        { label: 'Orga (.fr)', href: `https://orga-pr${pullRequestNumber}.review.pix.fr` },
        { label: 'Orga (.org)', href: `https://orga-pr${pullRequestNumber}.review.pix.org` },
      ],
    },
    {
      appName: 'pix-certif-review',
      getLinks: (pullRequestNumber) => [
        { label: 'Certif (.fr)', href: `https://certif-pr${pullRequestNumber}.review.pix.fr` },
        { label: 'Certif (.org)', href: `https://certif-pr${pullRequestNumber}.review.pix.org` },
      ],
    },
    {
      appName: 'pix-junior-review',
      getLinks: (pullRequestNumber) => [
        { label: 'Junior', href: `https://junior-pr${pullRequestNumber}.review.pix.fr` },
      ],
    },
    {
      appName: 'pix-admin-review',
      getLinks: (pullRequestNumber) => [{ label: 'Admin', href: `https://admin-pr${pullRequestNumber}.review.pix.fr` }],
    },
    {
      appName: 'pix-api-maddo-review',
      getLinks: (pullRequestNumber) => [
        { label: 'API MaDDo', href: `https://pix-api-maddo-review-pr${pullRequestNumber}.osc-fr1.scalingo.io/api/` },
      ],
    },
    {
      appName: 'pix-audit-logger-review',
      getLinks: (pullRequestNumber) => [
        {
          label: 'Audit Logger',
          href: `https://pix-audit-logger-review-pr${pullRequestNumber}.osc-fr1.scalingo.io/api/`,
        },
      ],
    },
  ],
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
  const scalingoDashboardUrl = `https://dashboard.scalingo.com/apps/osc-fr1/${scalingoReviewApps[0].appName}-pr${pullRequestId}/environment`;
  const shortenedRepositoryName = repositoryName.replace('pix-', '');
  const webApplicationUrl = `https://${shortenedRepositoryName}-pr${pullRequestId}.review.pix.fr`;
  const checkboxesForReviewAppsToBeDeployed = scalingoReviewApps
    .filter(({ isHidden }) => !isHidden)
    .map(({ appName, label, getLinks }) => {
      let links;
      if (getLinks) {
        links = getLinks(pullRequestId)
          .map(({ label, href }) => `[${label}](${href})`)
          .join(' – ');
      } else {
        links = `[${label ? label : appName.replace('-review', '')}](https://${appName}-pr${pullRequestId}.osc-fr1.scalingo.io/)`;
      }

      const scalingoDashboardLink = `[👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/${appName}-pr${pullRequestId}/environment)`;

      return `- [ ] ${links} | ${scalingoDashboardLink} <!-- ${appName} -->`;
    })
    .join('\n');
  const message = messageTemplate
    .replaceAll('{{pullRequestId}}', pullRequestId)
    .replaceAll('{{webApplicationUrl}}', webApplicationUrl)
    .replaceAll('{{scalingoDashboardUrl}}', scalingoDashboardUrl)
    .replaceAll('{{checkboxesForReviewAppsToBeDeployed}}', checkboxesForReviewAppsToBeDeployed);
  return message;
}

async function _handleCloseRA(
  request,
  dependencies = {
    scalingoClient: ScalingoClient,
    reviewAppRepo,
    updateCheckRADeployment,
  },
) {
  const payload = request.payload;
  const prNumber = payload.number;
  const repository = payload.pull_request.head.repo.name;
  const sha = payload.pull_request.head.sha;

  const reviewApps = repositoryToScalingoAppsReview[repository];

  if (!reviewApps) {
    return `${repository} is not managed by Pix Bot.`;
  }

  let client;
  const closedRA = [];

  try {
    client = await dependencies.scalingoClient.getInstance('reviewApps');
  } catch (error) {
    throw new Error(`Scalingo auth APIError: ${error.message}`);
  }

  for (const { appName } of reviewApps) {
    const reviewAppName = `${appName}-pr${prNumber}`;
    try {
      const reviewAppExists = await client.reviewAppExists(reviewAppName);
      // we remove the review app in any case
      await dependencies.reviewAppRepo.remove({ name: reviewAppName });
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

  await dependencies.updateCheckRADeployment({ repositoryName: repository, pullRequestNumber: prNumber, sha });

  const result = closedRA.map((ra) =>
    ra.isAlreadyClosed ? `${ra.name}-pr${prNumber} (already closed)` : `${ra.name}-pr${prNumber}`,
  );
  return `Closed RA for PR ${prNumber} : ${result.join(', ')}.`;
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

function isHandledByThisEnv(pullRequest) {
  if (config.github.pixBotEnvLabel) {
    if (!pullRequest) {
      return {
        message: `Ignoring event attached to no pull request`,
        shouldContinue: false,
      };
    }
    if (pullRequest.labels.some((label) => label.name === config.github.pixBotEnvLabel)) {
      return { shouldContinue: true };
    }
    return {
      message: `Ignoring because pull request should have the ${config.github.pixBotEnvLabel} label`,
      shouldContinue: false,
    };
  }

  if (!pullRequest) {
    return { shouldContinue: true };
  }
  if (pullRequest.labels.some((label) => label.name.startsWith('pix-bot-'))) {
    return { message: 'Ignoring because pull request is labelled with a pix-bot-xxx label', shouldContinue: false };
  }
  return { shouldContinue: true };
}

async function processWebhook(
  request,
  {
    pushOnDefaultBranchWebhook = _pushOnDefaultBranchWebhook,
    handlePullRequest = _handlePullRequest,
    handleCloseRA = _handleCloseRA,
    mergeQueue = _mergeQueue,
    githubService = commonGithubService,
    handleIssueComment = _handleIssueComment,
  } = {},
) {
  const eventName = request.headers['x-github-event'];
  const pullRequest = await githubService.getPullRequestForEvent(eventName, request);

  const { shouldContinue, message } = isHandledByThisEnv(pullRequest);
  if (!shouldContinue) {
    return message;
  }

  if (eventName === 'push') {
    return pushOnDefaultBranchWebhook(request);
  } else if (eventName === 'pull_request') {
    if (['opened', 'reopened', 'synchronize'].includes(request.payload.action)) {
      return handlePullRequest(request);
    }
    if (request.payload.action === 'closed') {
      const repositoryName = request.payload.repository.full_name;
      const isMerged = request.payload.pull_request.merged;
      const status = isMerged ? MERGE_STATUS.MERGED : MERGE_STATUS.ABORTED;
      await mergeQueue.unmanagePullRequest({ repositoryName, number: request.payload.number, status });
      return handleCloseRA(request);
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
  } else if (eventName === 'issue_comment') {
    if (request.payload.action === 'edited') {
      return handleIssueComment({ request, pullRequest });
    }
    return `Ignoring issue comment ${request.payload.action}`;
  } else {
    return `Ignoring ${eventName} event`;
  }
}

function shouldHandleIssueComment(request, pullRequest, reviewApps) {
  if (!reviewApps) {
    return { shouldContinue: false, message: 'Repository is not managed by Pix Bot.' };
  }

  if (request.payload.comment.user.login !== 'pix-bot-github') {
    return { shouldContinue: false, message: `Ignoring ${request.payload.comment.user.login} comment edition` };
  }

  if (pullRequest.head.repo.fork) {
    return { message: 'No RA for a fork', shouldContinue: false };
  }

  if (pullRequest.state !== 'open') {
    return { message: 'No RA for closed PR', shouldContinue: false };
  }

  return { shouldContinue: true };
}

async function _handleNoRACase(payload) {
  const repository = payload.pull_request.head.repo.name;
  const reviewApps = repositoryToScalingoAppsReview[repository];
  const isFork = payload.pull_request.head.repo.fork;
  const state = payload.pull_request.state;

  if (isFork) {
    return { message: 'No RA for a fork', shouldContinue: false };
  }
  if (!reviewApps) {
    return { message: 'No RA configured for this repository', shouldContinue: false };
  }
  if (state !== 'open') {
    return { message: 'No RA for closed PR', shouldContinue: false };
  }

  return { shouldContinue: true };
}

async function _handlePullRequest(
  request,
  dependencies = {
    handlePullRequestOpened,
    handlePullRequestSynchronize,
    handlePullRequestReopened,
  },
) {
  const payload = request.payload;

  const { shouldContinue, message } = await _handleNoRACase(payload);
  if (!shouldContinue) {
    return message;
  }

  if (payload.action === 'opened') {
    return dependencies.handlePullRequestOpened(request);
  }
  if (payload.action === 'synchronize') {
    return dependencies.handlePullRequestSynchronize(request);
  }
  if (payload.action === 'reopened') {
    return dependencies.handlePullRequestReopened(request);
  }
  return `Action ${payload.action} not handled`;
}

async function handlePullRequestOpened(
  request,
  dependencies = { addMessageToPullRequest, githubService: commonGithubService },
) {
  const pullRequestNumber = request.payload.number;
  const repository = request.payload.pull_request.head.repo.name;
  const sha = request.payload.pull_request.head.sha;

  const reviewApps = repositoryToScalingoAppsReview[repository];

  await dependencies.addMessageToPullRequest({
    repositoryName: repository,
    reviewApps,
    pullRequestNumber,
  });

  await dependencies.githubService.addRADeploymentCheck({
    repository,
    prNumber: pullRequestNumber,
    status: 'success',
    sha,
  });

  logger.info({
    event: 'review-app',
    message: `Commented on PR ${pullRequestNumber} in repository ${repository}`,
  });
  return `Commented on PR ${pullRequestNumber} in repository ${repository}`;
}

async function handlePullRequestSynchronize(
  request,
  dependencies = {
    scalingoClient: ScalingoClient,
    reviewAppRepo,
    updateCheckRADeployment,
  },
) {
  const ref = request.payload.pull_request.head.ref;
  const pullRequestNumber = request.payload.number;
  const repository = request.payload.pull_request.head.repo.name;
  const sha = request.payload.pull_request.head.sha;

  const client = await dependencies.scalingoClient.getInstance('reviewApps');

  const existingApps = await dependencies.reviewAppRepo.listForPullRequest({
    repository,
    prNumber: pullRequestNumber,
  });

  for (const app of existingApps) {
    await dependencies.reviewAppRepo.setStatus({ name: app.name, status: 'pending' });
    await client.deployUsingSCM(app.name, ref);
  }

  await dependencies.updateCheckRADeployment({ repositoryName: repository, pullRequestNumber, sha });

  logger.info({
    event: 'review-app',
    message: `Deployed on PR ${pullRequestNumber} in repository ${repository}`,
  });

  return `Deployed on PR ${pullRequestNumber} in repository ${repository}`;
}

async function handlePullRequestReopened(
  request,
  dependencies = { updateMessageToPullRequest, githubService: commonGithubService },
) {
  const pullRequestNumber = request.payload.number;
  const repositoryName = request.payload.pull_request.head.repo.name;
  const sha = request.payload.pull_request.head.sha;

  const reviewApps = repositoryToScalingoAppsReview[repositoryName];

  await dependencies.updateMessageToPullRequest({
    repositoryName,
    reviewApps,
    pullRequestNumber,
  });

  await dependencies.githubService.addRADeploymentCheck({
    repository: repositoryName,
    prNumber: pullRequestNumber,
    status: 'success',
    sha,
  });

  logger.info({
    event: 'review-app',
    message: `Comment updated on reopened PR ${pullRequestNumber} in repository ${repositoryName}`,
  });
  return `Comment updated on reopened PR ${pullRequestNumber} in repository ${repositoryName}`;
}

async function addMessageToPullRequest(
  { repositoryName, reviewApps, pullRequestNumber },
  dependencies = { githubService: commonGithubService },
) {
  const template = getMessageTemplate(repositoryName, true);
  const message = getMessage(repositoryName, pullRequestNumber, reviewApps, template);
  await dependencies.githubService.commentPullRequest({
    repositoryName,
    pullRequestId: pullRequestNumber,
    comment: message,
  });
}

async function updateMessageToPullRequest(
  { repositoryName, reviewApps, pullRequestNumber },
  dependencies = { githubService: commonGithubService },
) {
  const comments = await dependencies.githubService.getPullRequestComments({ repositoryName, pullRequestNumber });

  const deploymentRAComment = comments.find((comment) => comment.user.login === 'pix-bot-github');
  const template = getMessageTemplate(repositoryName, true);
  const message = getMessage(repositoryName, pullRequestNumber, reviewApps, template);

  if (!deploymentRAComment) {
    await dependencies.githubService.commentPullRequest({
      repositoryName,
      pullRequestId: pullRequestNumber,
      comment: message,
    });
    return;
  }

  await dependencies.githubService.editPullRequestComment({
    repositoryName,
    commentId: deploymentRAComment.id,
    newComment: message,
  });
}

async function _handleIssueComment(
  { request, pullRequest },
  dependencies = { reviewAppRepo, createReviewApp, removeReviewApp, updateCheckRADeployment },
) {
  const repositoryName = pullRequest.head.repo.name;
  const sha = pullRequest.head.sha;

  const reviewAppNames = repositoryToScalingoAppsReview[repositoryName]?.map(({ appName }) => appName);

  const { shouldContinue, message } = shouldHandleIssueComment(request, pullRequest, reviewAppNames);
  if (!shouldContinue) {
    return message;
  }

  const body = request.payload.comment.body;
  const pullRequestNumber = request.payload.issue.number;
  let selectedApps = Array.from(body.matchAll(/^- \[[xX]\].+<!-- ([\w-]+) -->$/gm), ([, app]) => app);

  selectedApps = selectedApps.filter((app) => {
    const isAllowed = reviewAppNames.includes(app);
    if (!isAllowed) {
      logger.warn({
        event: 'review-app',
        message: `selected app ${app} unknown for repository ${repositoryName}`,
      });
    }
    return isAllowed;
  });

  const existingApps = await dependencies.reviewAppRepo.listForPullRequest({
    repository: repositoryName,
    prNumber: pullRequestNumber,
  });

  const reviewAppsToCreate = selectedApps
    .filter((parentApp) => !existingApps.some((app) => app.parentApp === parentApp))
    .map((parentApp) => ({
      parentApp,
      reviewAppName: `${parentApp}-pr${pullRequestNumber}`,
    }));
  const reviewAppsToRemove = existingApps.filter((app) => !selectedApps.includes(app.parentApp)).map((app) => app.name);

  const ref = pullRequest.head.ref;

  for (const { reviewAppName, parentApp } of reviewAppsToCreate) {
    await dependencies.createReviewApp({ reviewAppName, repositoryName, pullRequestNumber, ref, parentApp });
  }

  for (const reviewAppName of reviewAppsToRemove) {
    await dependencies.removeReviewApp({ reviewAppName });
  }

  const messages = [];
  if (reviewAppsToCreate.length) {
    messages.push(`Created review apps: ${reviewAppsToCreate.map(({ reviewAppName }) => reviewAppName).join(', ')}`);
  }
  if (reviewAppsToRemove.length) {
    messages.push(`Removed review apps: ${reviewAppsToRemove.join(', ')}`);
  }
  if (!messages.length) {
    return 'Nothing to do';
  }
  await dependencies.updateCheckRADeployment({ repositoryName, pullRequestNumber, sha });
  return messages.join('\n');
}

async function createReviewApp(
  { reviewAppName, repositoryName, pullRequestNumber, ref, parentApp },
  dependencies = { scalingoClient: ScalingoClient, reviewAppRepo },
) {
  const client = await dependencies.scalingoClient.getInstance('reviewApps');

  const reviewAppExists = await client.reviewAppExists(reviewAppName);
  if (reviewAppExists) {
    return;
  }

  await dependencies.reviewAppRepo.create({
    name: reviewAppName,
    repository: repositoryName,
    prNumber: pullRequestNumber,
    parentApp,
  });
  await client.deployReviewApp(parentApp, pullRequestNumber);
  await client.disableAutoDeploy(reviewAppName);
  await client.deployUsingSCM(reviewAppName, ref);
}

async function removeReviewApp({ reviewAppName }, dependencies = { scalingoClient: ScalingoClient, reviewAppRepo }) {
  const client = await dependencies.scalingoClient.getInstance('reviewApps');

  const reviewAppExists = await client.reviewAppExists(reviewAppName);

  await dependencies.reviewAppRepo.remove({ name: reviewAppName });

  if (!reviewAppExists) return;

  await client.deleteReviewApp(reviewAppName);
}

export {
  getMessage,
  getMessageTemplate,
  processWebhook,
  _pushOnDefaultBranchWebhook as pushOnDefaultBranchWebhook,
  _handleCloseRA as handleCloseRA,
  _handlePullRequest as handlePullRequest,
  handlePullRequestOpened,
  handlePullRequestSynchronize,
  handlePullRequestReopened,
  addMessageToPullRequest,
  updateMessageToPullRequest,
  _handleIssueComment as handleIssueComment,
  createReviewApp,
  removeReviewApp,
  repositoryToScalingoAppsReview,
};
