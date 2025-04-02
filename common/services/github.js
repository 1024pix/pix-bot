import crypto from 'node:crypto';

import Boom from '@hapi/boom';
import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import _ from 'lodash';
import fetch from 'node-fetch';
import tsscmp from 'tsscmp';

import { config } from '../../config.js';
import { logger } from './logger.js';

const color = {
  'team-evaluation': '#FDEEC1',
  'team-prescription': '#F2B2A8',
  'team-captains': '#a6ea5d',
  'team-certif': '#B7CEF5',
  'team-acces': '#A2DCC1',
};

function _logRequest(message) {
  const data = message.split(' ');
  const verb = data[0];
  const url = data[1];
  const responseCode = data[3];
  const responseTime = data[5];
  const event = 'github-request';
  const request = {
    event,
    verb,
    url,
    responseCode,
    responseTime,
  };

  if (url.startsWith('/repos/1024pix/pix-bot-publish-test')) {
    return;
  }
  logger.info({
    event: 'github',
    message: request,
  });
}

function _createOctokit() {
  const authCredentials = {};
  if (config.github.token) {
    authCredentials.auth = config.github.token;
  }
  const octokit = new Octokit({
    ...authCredentials,
    request: { fetch },
    log: {
      debug: _.noop,
      info: _logRequest,
      // eslint-disable-next-line no-console
      warn: console.warn,
      // eslint-disable-next-line no-console
      error: console.error,
    },
  });
  octokit.hook.error('request', async (error) => {
    logger.error({
      event: 'github',
      message: error.response?.data,
    });

    return error;
  });
  return octokit;
}

async function _getPullReviewsFromGithub(label) {
  const owner = config.github.owner;

  label = label.replace(/ /g, '%20');
  const octokit = _createOctokit();

  const params = [{ is: 'pr' }, { is: 'open' }, { archived: false }, { draft: false }, { user: owner }, { label }];
  const response = await octokit.search.issuesAndPullRequests({
    q: _buildOctokitSearchQueryString(params),
    sort: 'updated',
    order: 'desc',
  });

  if (response.status !== 200) {
    throw new Error('Cannot retrieve PR from Github');
  }
  return response.data.items;
}

async function _getReviewsFromGithub(pull_number) {
  const owner = config.github.owner;
  const repo = config.github.repository;
  const octokit = _createOctokit();
  const { data } = await octokit.pulls.listReviews({
    owner,
    repo,
    pull_number,
  });
  return data;
}

function _getEmojis(pullRequests) {
  const labelsEmojis = pullRequests.labels.map((label) => {
    const match = label.name.match(/^:[A-z,_-]*:/);
    return match ? match[0] : '';
  });
  return labelsEmojis.filter(Boolean).join(' ');
}

function _getReviewsLabel(reviews) {
  const approvedReviews = reviews.filter((review) => review.state === 'APPROVED');
  const dismissedReviews = reviews.filter((review) => review.state === 'DISMISSED');
  const clearedReviews = reviews.filter((review) => {
    if (review.state === 'CHANGES_REQUESTED') {
      const hasBeenApproved =
        approvedReviews.find((approvedReview) => approvedReview.user.id === review.user.id) !== undefined;
      const hasBeenDismissed =
        dismissedReviews.find((dismissedReview) => dismissedReview.user.id === review.user.id) !== undefined;
      return !(hasBeenApproved || hasBeenDismissed);
    }

    return true;
  });

  const countByState = _.countBy(clearedReviews, 'state');
  return _.entries(countByState)
    .map(([label, times]) => {
      switch (label) {
        case 'COMMENTED':
          return `💬x${times}`;
        case 'APPROVED':
          return `✅x${times}`;
        case 'CHANGES_REQUESTED':
          return `❌x${times}`;
      }
    })
    .join(' ');
}

function _createResponseForSlack(data, label) {
  const attachments = data
    .map(({ pullRequest, reviews }) => {
      const emojis = _getEmojis(pullRequest);
      const reviewsLabel = _getReviewsLabel(reviews);
      const link = `<${pullRequest.html_url}|${pullRequest.title}>`;
      const message = [reviewsLabel, emojis, link].filter(Boolean).join(' | ');
      return {
        color: color[label],
        pretext: '',
        fields: [{ value: message, short: false }],
      };
    })
    .sort(_sortWithInProgressLast);

  return {
    response_type: 'in_channel',
    text: 'PRs à review pour ' + label,
    attachments,
  };
}

function _sortWithInProgressLast(prA, prB) {
  const fieldA = prA.fields[0].value;
  const fieldB = prB.fields[0].value;
  const inProgressIcon = ':construction:';
  const isAinProgress = fieldA.indexOf(inProgressIcon) !== -1;
  const isBinProgress = fieldB.indexOf(inProgressIcon) !== -1;

  if (isAinProgress && !isBinProgress) return 1;
  if (!isAinProgress && isBinProgress) return -1;
  return fieldA.localeCompare(fieldB);
}

async function getLastCommitUrl({ branchName, tagName, owner, repo }) {
  if (branchName) {
    return await _getBranchLastCommitUrl({ owner, repo, branch: branchName });
  }
  return _getTagCommitUrl({ owner, repo, tagName });
}

async function _getBranchLastCommitUrl({ owner, repo, branch }) {
  const octokit = _createOctokit();
  const { data } = await octokit.repos.getBranch({
    owner,
    repo,
    branch,
  });
  return data.commit.url;
}

async function _getTagCommitUrl({ owner, repo, tagName }) {
  const tags = await _getTags(owner, repo);
  const tag = tags.find((tag) => tag.name === tagName);
  if (!tag) {
    logger.error({ message: `Could not find the tag ${tagName} on ${owner}/${repo}` });
    throw new Error(`Could not find the tag ${tagName} on ${owner}/${repo}`);
  }
  return tag.commit.url;
}

async function getLatestRelease(repoOwner, repoName) {
  const tags = await _getTags(repoOwner, repoName);
  if (tags) {
    return tags[0];
  }
  throw Boom.serverUnavailable('tto');
}

async function getSecondToLastRelease(repoOwner, repoName) {
  const tags = await _getTags(repoOwner, repoName);
  return tags[1];
}

async function _getTags(repoOwner, repoName) {
  const { repos } = _createOctokit();
  const { data } = await repos.listTags({
    owner: repoOwner,
    repo: repoName,
  });
  return data;
}

async function _getDefaultBranch(repoOwner, repoName) {
  const { repos } = _createOctokit();
  const { data } = await repos.get({
    owner: repoOwner,
    repo: repoName,
  });
  return data.default_branch;
}

async function _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, branchName) {
  const baseBranch = branchName || (await _getDefaultBranch(repoOwner, repoName));
  const { pulls } = _createOctokit();
  const { data } = await pulls.list({
    owner: repoOwner,
    repo: repoName,
    base: baseBranch,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 100,
  });
  return data;
}

async function _getLatestReleaseTagUrl(repoOwner, repoName) {
  const latestReleaseTag = await getLatestRelease(repoOwner, repoName);
  return latestReleaseTag.commit.url;
}

async function _getSecondToLastReleaseTagUrl(repoOwner, repoName) {
  const secondToLastReleaseTag = await getSecondToLastRelease(repoOwner, repoName);
  return secondToLastReleaseTag.commit.url;
}

async function _getLatestReleaseTagName(repoOwner, repoName) {
  const latestReleaseTag = await getLatestRelease(repoOwner, repoName);
  return latestReleaseTag.name;
}

async function _getCommitAtURL(commitUrl) {
  const { request } = _createOctokit();
  const { data } = await request(commitUrl);
  return data.commit;
}

async function _getLatestReleaseDate(repoOwner, repoName) {
  const latestTagUrl = await _getLatestReleaseTagUrl(repoOwner, repoName);

  const commit = await _getCommitAtURL(latestTagUrl);
  return commit.committer.date;
}

async function _getSecondToLastReleaseDate(repoOwner, repoName) {
  const secondToLastTagUrl = await _getSecondToLastReleaseTagUrl(repoOwner, repoName);
  const commit = await _getCommitAtURL(secondToLastTagUrl);
  return commit.committer.date;
}

async function _getCommitsWhereConfigFileHasChangedBetweenDate(repoOwner, repoName, sinceDate, untilDate) {
  const { repos } = _createOctokit();
  const { data } = await repos.listCommits({
    owner: repoOwner,
    repo: repoName,
    since: sinceDate,
    until: untilDate,
    path: 'api/src/shared/config.js',
  });

  return data;
}

function _verifyRequestSignature(webhookSecret, body, signature) {
  if (!signature) {
    throw Boom.unauthorized('Github signature is empty.');
  }
  const [, hash] = signature.split('=');
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(body);

  if (!tsscmp(hash, hmac.digest('hex'))) {
    throw Boom.unauthorized('Github signature verification failed. Signature mismatch.');
  }
}

function _buildOctokitSearchQueryString(params = []) {
  return params.map((p) => `${Object.keys(p)}:${Object.values(p)}`).join('+');
}

const commentPullRequest = async ({ repositoryName, pullRequestId, comment }) => {
  const owner = config.github.owner;
  const octokit = _createOctokit();
  await octokit.issues.createComment({
    owner,
    repo: repositoryName,
    issue_number: pullRequestId,
    body: comment,
  });
};

async function _getPullRequestsFromCommitShaFromGithub({ repoOwner, repoName, commitSha }) {
  const { repos } = _createOctokit();
  const { data } = await repos.listPullRequestsAssociatedWithCommit({
    owner: repoOwner,
    repo: repoName,
    commit_sha: commitSha,
  });

  return data ? data : [];
}

async function _getPullRequestsDetailsByCommitShas({ repoOwner, repoName, commitsShaList }) {
  const pullRequests = [];

  await Promise.all(
    commitsShaList.map(async (commitSha) => {
      const pullRequestsByCommitSha = await _getPullRequestsFromCommitShaFromGithub({
        repoOwner,
        repoName,
        commitSha,
      });
      pullRequestsByCommitSha.map((pullRequestDetails) => {
        pullRequests.push(pullRequestDetails);
      });
    }),
  );

  const pullRequestsForCommitShaFilteredDetails = Array.from(new Set(pullRequests.map(JSON.stringify))).map(JSON.parse);

  pullRequestsForCommitShaFilteredDetails.forEach((pullRequest) => {
    pullRequest.labels = pullRequest.labels
      .filter((label) => label.name.includes('team'))
      .map((label) => label.name)
      .join(',');
  });

  return pullRequestsForCommitShaFilteredDetails;
}

async function createCommitStatus({ context, repo, pull_number, description, state, target_url }) {
  const owner = '1024pix';
  const octokit = _createOctokit();

  let response = await octokit.pulls.get({ owner, repo, pull_number });
  const sha = response.data.head.sha;

  response = await octokit.repos.createCommitStatus({
    owner,
    context,
    description,
    repo,
    sha,
    state,
    target_url,
  });

  const startedAt = response.data.started_at;
  logger.info(`Check ${context} added for PR ${pull_number} in ${repo} with status ${state}`);

  return startedAt;
}

async function setMergeQueueStatus({ repositoryFullName, prNumber, status, description }) {
  const repository = repositoryFullName.split('/')[1];
  return createCommitStatus({
    context: 'merge-queue-status',
    repo: repository,
    pull_number: prNumber,
    state: status,
    description,
    target_url: 'https://github.com/1024pix/pix-actions/actions/workflows/auto-merge-dispatch.yml',
  });
}

async function addRADeploymentCheck({ repository, prNumber, status }) {
  return createCommitStatus({
    context: 'check-ra-deployment',
    repo: repository,
    pull_number: prNumber,
    state: status,
  });
}

const github = {
  async getPullRequests(label) {
    const pullRequests = await _getPullReviewsFromGithub(label);
    const reviewsByPR = await Promise.all(pullRequests.map(({ number }) => _getReviewsFromGithub(number)));

    const data = _.zipWith(pullRequests, reviewsByPR, (pullRequest, reviews) => {
      return {
        pullRequest,
        reviews,
      };
    });

    return _createResponseForSlack(data, label);
  },

  async getLatestReleaseTag(repoName = config.github.repository) {
    return _getLatestReleaseTagName(config.github.owner, repoName);
  },

  getLastCommitUrl,

  async getCommitAtURL(commitUrl) {
    return _getCommitAtURL(commitUrl);
  },

  async getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, branchName) {
    return _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, branchName);
  },

  async getDefaultBranch(repoOwner, repoName) {
    return _getDefaultBranch(repoOwner, repoName);
  },

  async isBuildStatusOK({ branchName, tagName }) {
    const githubCICheckName = 'build-test-and-deploy';
    const { owner, repository: repo } = config.github;
    const commitUrl = await getLastCommitUrl({ branchName, tagName, owner, repo });
    const commitStatusUrl = commitUrl + '/check-runs';
    const octokit = _createOctokit();
    const { data } = await octokit.request(commitStatusUrl);
    const runs = data.check_runs;
    const ciRuns = runs.filter((run) => run.name === githubCICheckName);
    const buildStatusOk = ciRuns.every((run) => run.status === 'completed' && run.conclusion === 'success');
    return ciRuns.length > 0 && buildStatusOk;
  },

  async getChangelogSinceLatestRelease(repoOwner = config.github.owner, repoName = config.github.repository) {
    const latestReleaseDate = await _getLatestReleaseDate(repoOwner, repoName);
    const pullRequests = await _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName);
    const pullRequestsSinceLatestRelease = pullRequests.filter((PR) => PR.merged_at > latestReleaseDate);

    return pullRequestsSinceLatestRelease.map((PR) => `${PR.title}`);
  },

  async hasConfigFileChangedSinceLatestRelease(repoOwner = config.github.owner, repoName = config.github.repository) {
    const latestReleaseDate = await _getLatestReleaseDate(repoOwner, repoName);
    const now = new Date().toISOString();
    const commits = await _getCommitsWhereConfigFileHasChangedBetweenDate(repoOwner, repoName, latestReleaseDate, now);
    const commitsShaList = commits.map((commit) => commit.sha);
    const hasConfigFileChanged = commits.length > 0;
    const latestTag = await _getLatestReleaseTagName(repoOwner, repoName);

    const pullRequestsForCommitShaDetails = await _getPullRequestsDetailsByCommitShas({
      repoOwner,
      repoName,
      commitsShaList,
    });

    return { hasConfigFileChanged, latestTag, pullRequestsForCommitShaDetails };
  },

  async hasConfigFileChangedInLatestRelease(repoOwner = config.github.owner, repoName = config.github.repository) {
    const latestReleaseDate = await _getLatestReleaseDate(repoOwner, repoName);
    const secondToLastReleaseDate = await _getSecondToLastReleaseDate(repoOwner, repoName);
    const commits = await _getCommitsWhereConfigFileHasChangedBetweenDate(
      repoOwner,
      repoName,
      secondToLastReleaseDate,
      latestReleaseDate,
    );
    return commits.length > 0;
  },

  async getPullRequestDetails({ number, repositoryName }) {
    const octokit = _createOctokit();
    const { data } = await octokit.request(`GET /repos/${repositoryName}/pulls/${number}`);
    return data;
  },

  verifyWebhookSignature(request) {
    const { headers, payload } = request;

    const webhookSecret = config.github.webhookSecret;
    const signature = headers['x-hub-signature-256'];
    const stringBody = payload ? JSON.stringify(payload) : '';

    try {
      _verifyRequestSignature(webhookSecret, stringBody, signature);
    } catch (error) {
      return error;
    }
    return true;
  },
  commentPullRequest,
  addRADeploymentCheck,
  setMergeQueueStatus,

  createCommitStatus,

  async checkUserBelongsToPix(username) {
    const octokit = _createOctokit();
    const response = await octokit.request('GET /orgs/{org}/members/{username}', {
      org: '1024pix',
      username,
    });
    return response.status === 204;
  },

  async triggerWorkflow({ workflow, inputs }) {
    const octokit = _createOctokit();
    await octokit.request(`POST /repos/${workflow.repositoryName}/actions/workflows/${workflow.id}/dispatches`, {
      ref: workflow.ref,
      inputs,
    });
  },

  async isPrLabelledWith({ number, repositoryName, label }) {
    const octokit = _createOctokit();
    const { data } = await octokit.request(`GET /repos/${repositoryName}/pulls/${number}`);
    return data.labels.some((ghLabel) => ghLabel.name === label);
  },

  async isMergeable({ number, repositoryName, pollDelay = 10_000 }) {
    const octokit = _createOctokit();
    let data;
    do {
      const response = await octokit.request(`GET /repos/${repositoryName}/pulls/${number}`);
      data = response.data;
      await new Promise((resolve) => setTimeout(resolve, pollDelay));
    } while (data.mergeable === null);

    return data.mergeable;
  },

  async updatePullRequestBranch({ number, repositoryName, pollDelay = 10_000 }) {
    const graphqlWithAuth = graphql.defaults({
      request: { fetch },
      headers: {
        authorization: `token ${config.github.token}`,
      },
    });

    if (!(await this.isMergeable({ number, repositoryName, pollDelay }))) {
      return false;
    }

    const octokit = _createOctokit();
    const response = await octokit.request(`GET /repos/${repositoryName}/pulls/${number}`);

    const pullRequestId = response.data.node_id;
    await graphqlWithAuth(
      `mutation ($pullRequestId: ID!, $updateMethod: PullRequestBranchUpdateMethod!) {
        updatePullRequestBranch(input: {
          pullRequestId: $pullRequestId,
          updateMethod: $updateMethod
        }) {
          pullRequest {
            updatedAt,
          }
        }
      }`,
      {
        pullRequestId,
        updateMethod: 'REBASE',
      },
    );

    return true;
  },

  async enableAutoMerge({ number, repositoryName }) {
    const graphqlWithAuth = graphql.defaults({
      request: { fetch },
      headers: {
        authorization: `token ${config.github.token}`,
      },
    });

    const octokit = _createOctokit();
    const { data } = await octokit.request(`GET /repos/${repositoryName}/pulls/${number}`);

    const pullRequestId = data.node_id;
    const { enablePullRequestAutoMerge } = await graphqlWithAuth(
      `mutation ($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
        enablePullRequestAutoMerge(input: {
          pullRequestId: $pullRequestId,
          mergeMethod: $mergeMethod
        }) {
          pullRequest {
            autoMergeRequest {
              enabledAt
              enabledBy {
                login
              }
            }
          }
        }
      }`,
      {
        pullRequestId,
        mergeMethod: 'MERGE',
      },
    );
    return enablePullRequestAutoMerge.pullRequest.autoMergeRequest;
  },
};

export default github;
