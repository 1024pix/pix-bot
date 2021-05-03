const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const settings = require('../../config');
const { zipWith, countBy, entries, noop } = require('lodash');

const color = {
  'team-evaluation': '#FDEEC1',
  'team-prescription': '#F2B2A8',
  'team-captains': '#a6ea5d',
  'team-certif': '#B7CEF5',
  'team-acces': '#A2DCC1',
};

function createOctokit() {
  return new Octokit({
    auth: settings.github.token,
    log: {
      debug: noop,
      info: noop,
      warn: console.warn,
      error: console.error
    },
  });
}

async function getPullReviewsFromGithub(label){
  const owner = settings.github.owner;

  label = label.replace(/ /g, '%20');
  const octokit = createOctokit();
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `is:pr+is:open+archived:false+user:${owner}+label:${label}`,
    sort: 'updated',
    order: 'desc'
  });

  return data.items;
}

async function getReviewsFromGithub(pull_number){
  const owner = settings.github.owner;
  const repo = settings.github.repository;
  const octokit = createOctokit();
  const { data } = await octokit.pulls.listReviews({
    owner,
    repo,
    pull_number
  });
  return data;
}

function getEmojis(pullRequests) {
  const labelsEmojis = pullRequests.labels.map(label => {
    const match = label.name.match(/^:[A-z,_,-]*:/);
    return match ? match[0] : '';
  });
  return labelsEmojis.filter(Boolean).join(' ');
}

function getReviewsLabel(reviews) {
  const countByState = countBy(reviews, 'state');
  return entries(countByState)
    .map(([label, times]) => {
      switch(label) {
      case 'COMMENTED': return `💬x${times}`;
      case 'APPROVED': return `✅x${times}`;
      case 'CHANGES_REQUESTED': return `❌x${times}`;
      }
    }).join('|');
}

function createResponseForSlack(data, label) {
  const attachments = data.map(({pullRequest, reviews}) => {
    const emojis = getEmojis(pullRequest);
    const reviewsLabel = getReviewsLabel(reviews);
    return {
      color: color[label],
      pretext: '',
      fields:[ {value: `[${reviewsLabel}]${emojis}<${pullRequest.html_url}|${pullRequest.title}>`, short: false},],
    };
  });

  const response = {
    response_type: 'in_channel',
    text: 'PRs à review pour ' + label,
    attachments: attachments.sort().reverse()
  };

  return response;
}

async function getLastCommitUrl({ branchName, tagName }) {
  if (branchName) {
    return await getBranchLastCommitUrl(branchName);
  }
  return getTagCommitUrl(tagName);
}

async function getBranchLastCommitUrl(branch) {
  const owner = settings.github.owner;
  const repo = settings.github.repository;
  const octokit = createOctokit();
  const { data } = await octokit.repos.getBranch({
    owner,
    repo,
    branch,
  });
  return data.commit.url;
}

async function getTagCommitUrl(tagName) {
  const owner = settings.github.owner;
  const repo = settings.github.repository;
  const tags = await getTags(owner, repo);
  const tag = tags.find((tag) => tag.name === tagName);
  return tag.commit.url;
}

async function getLatestRelease(repoOwner, repoName) {
  const tags = await getTags(repoOwner, repoName);
  return tags[0];
}

async function getTags(repoOwner, repoName) {
  const { repos } = createOctokit();
  const { data } = await repos.listTags({
    owner: repoOwner,
    repo: repoName,
  });
  return data;
}

async function getDefaultBranch(repoOwner, repoName) {
  const { repos } = createOctokit();
  const { data } = await repos.get({
    owner: repoOwner,
    repo: repoName,
  });
  return data.default_branch;
}

async function _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName) {
  const defaultBranch = await getDefaultBranch(repoOwner, repoName);
  const { pulls } = createOctokit();
  const { data } = await pulls.list({
    owner: repoOwner,
    repo: repoName,
    base: defaultBranch,
    state: 'closed',
    sort: 'updated',
    direction: 'desc'
  });
  return data;
}

async function _getLatestReleaseTagUrl(repoOwner, repoName) {
  const latestReleaseTag = await getLatestRelease(repoOwner, repoName);
  return latestReleaseTag.commit.url;
}

async function _getLatestReleaseTagName(repoOwner, repoName) {
  const latestReleaseTag = await getLatestRelease(repoOwner, repoName);
  return latestReleaseTag.name;
}

async function _getCommitAtURL(commitUrl) {
  const { request } = createOctokit();
  const { data } = await request(commitUrl);
  return data.commit;
}

async function _getLatestReleaseDate(repoOwner, repoName) {
  const latestTagUrl = await _getLatestReleaseTagUrl(repoOwner, repoName);

  const commit = await _getCommitAtURL(latestTagUrl);
  return commit.committer.date;
}

module.exports = {

  async getPullRequests(label) {
    const pullRequests = await getPullReviewsFromGithub(label);
    const reviewsByPR = await Promise.all(
      pullRequests.map(({number}) => getReviewsFromGithub(number))
    );

    const data = zipWith(pullRequests, reviewsByPR, (pullRequest, reviews) => {
      return {
        pullRequest,
        reviews,
      };
    });

    return createResponseForSlack(data, label);
  },

  async getLatestReleaseTag(repoName = settings.github.repository) {
    return _getLatestReleaseTagName(settings.github.owner, repoName);
  },

  async getLatestReleaseTagUrl(repoOwner, repoName = settings.github.repository) {
    return _getLatestReleaseTagUrl(repoOwner, repoName);
  },

  async getCommitAtURL(commitUrl) {
    return _getCommitAtURL(commitUrl);
  },

  async getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName) {
    return _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName);
  },

  async isBuildStatusOK({ branchName, tagName }) {
    const githubCICheckName = 'build-test-and-deploy';
    const commitUrl = await getLastCommitUrl({ branchName, tagName });
    const commitStatusUrl = commitUrl + '/check-runs';
    const octokit = createOctokit();
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

};
