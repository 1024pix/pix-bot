const { Octokit } = require('@octokit/rest');
const fetch = require('node-fetch');
const { zipWith, countBy, entries, noop } = require('lodash');
const crypto = require('crypto');
const tsscmp = require('tsscmp');
const Boom = require('@hapi/boom');
const settings = require('../../config');
const logger = require('./logger');

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
  if (settings.github.token) {
    authCredentials.auth = settings.github.token;
  }
  const octokit = new Octokit({
    ...authCredentials,
    request: { fetch },
    log: {
      debug: noop,
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
      message: error.response.data,
    });

    return error;
  });
  return octokit;
}

async function _getPullReviewsFromGithub(label) {
  const owner = settings.github.owner;

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
  const owner = settings.github.owner;
  const repo = settings.github.repository;
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
  const countByState = countBy(reviews, 'state');
  return entries(countByState)
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
    path: settings.api.configFilename,
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
  const owner = settings.github.owner;
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

async function getPullRequestsDetailsByCommitShas({ repoOwner, repoName, commitsShaList }) {
  let pullRequests = [];

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

module.exports = {
  async getPullRequests(label) {
    const pullRequests = await _getPullReviewsFromGithub(label);
    const reviewsByPR = await Promise.all(pullRequests.map(({ number }) => _getReviewsFromGithub(number)));

    const data = zipWith(pullRequests, reviewsByPR, (pullRequest, reviews) => {
      return {
        pullRequest,
        reviews,
      };
    });

    return _createResponseForSlack(data, label);
  },

  async getLatestReleaseTag(repoName = settings.github.repository) {
    return _getLatestReleaseTagName(settings.github.owner, repoName);
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
    const { owner, repository: repo } = settings.github;
    const commitUrl = await getLastCommitUrl({ branchName, tagName, owner, repo });
    const commitStatusUrl = commitUrl + '/check-runs';
    const octokit = _createOctokit();
    const { data } = await octokit.request(commitStatusUrl);
    const runs = data.check_runs;
    const ciRuns = runs.filter((run) => run.name === githubCICheckName);
    const buildStatusOk = ciRuns.every((run) => run.status === 'completed' && run.conclusion === 'success');
    return ciRuns.length > 0 && buildStatusOk;
  },

  async getChangelogSinceLatestRelease(repoOwner = settings.github.owner, repoName = settings.github.repository) {
    const latestReleaseDate = await _getLatestReleaseDate(repoOwner, repoName);
    const pullRequests = await _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName);
    const pullRequestsSinceLatestRelease = pullRequests.filter((PR) => PR.merged_at > latestReleaseDate);

    return pullRequestsSinceLatestRelease.map((PR) => `${PR.title}`);
  },

  async hasConfigFileChangedSinceLatestRelease(
    repoOwner = settings.github.owner,
    repoName = settings.github.repository,
  ) {
    const latestReleaseDate = await _getLatestReleaseDate(repoOwner, repoName);
    const now = new Date().toISOString();
    const commits = await _getCommitsWhereConfigFileHasChangedBetweenDate(repoOwner, repoName, latestReleaseDate, now);
    const commitsShaList = commits.map((commit) => commit.sha);
    const hasConfigFileChanged = commits.length > 0;
    const latestTag = await _getLatestReleaseTagName(repoOwner, repoName);

    const pullRequestsForCommitShaDetails = await getPullRequestsDetailsByCommitShas({
      repoOwner,
      repoName,
      commitsShaList,
    });

    return { hasConfigFileChanged, latestTag, pullRequestsForCommitShaDetails };
  },

  async hasConfigFileChangedInLatestRelease(repoOwner = settings.github.owner, repoName = settings.github.repository) {
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

  verifyWebhookSignature(request) {
    const { headers, payload } = request;

    const webhookSecret = settings.github.webhookSecret;
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

  async getFilesAndCommitsModifiedBetweenTwoReleases(endpoint) {
    const octokit = _createOctokit();
    const response = await octokit.repos.compareCommits(endpoint);
    const data = response?.data;

    if (!data) {
      throw Boom.serverUnavailable(`No data from Github from ${endpoint}`);
    }

    if (!data.files) {
      throw Boom.serverUnavailable(`No files from Github  from ${endpoint}`);
    }

    return { files: data.files, commits: data.commits };
  },
  getPullRequestsDetailsByCommitShas,

  async getCommitsDetails({ repoOwner, repoName, commits }) {
    const octokit = _createOctokit();
    return await Promise.all(
      commits.map(async (ref) =>
        octokit.repos.getCommit({
          owner: repoOwner,
          repo: repoName,
          ref,
        }),
      ),
    );
  },
};
