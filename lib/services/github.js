const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const settings = require('../../config');

const color = {
  'team-evaluation': '#FDEEC1',
  'team-prescription': '#F2B2A8',
  'team-captains': '#a6ea5d',
  'team-certif': '#B7CEF5',
  'team-acces': '#A2DCC1',
};

function getUrlForGithub(label) {
  label = label.replace(/ /g, '%20');
  return `https://api.github.com/search/issues?q=is:pr+is:open+archived:false+sort:updated-desc+user:1024pix+label:${label}`;
}

async function getDataFromGithub(label) {
  const url = getUrlForGithub(label);
  const githubToken = settings.github.token;
  const config = {
    headers: {
      'Authorization': 'token ' + githubToken
    }
  };
  return axios.get(url, config)
    .then(response => {
      return response.data.items;
    })
    .catch(error => {
      console.log(error);
    });
}

function getEmojis(pullRequests) {
  const labelsEmojis = pullRequests.labels.map(label => {
    const match = label.name.match(/^:[A-z,_,-]*:/);
    return match ? match[0] : '';
  });
  return labelsEmojis.filter(Boolean).join(' ');
}

function createResponseForSlack(pullRequests, label) {
  const attachments = pullRequests.map((pullRequests) => {
    const emojis = getEmojis(pullRequests);
    return {
      color: color[label],
      pretext: '',
      fields:[ {value: `${emojis}<${pullRequests.html_url}|${pullRequests.title}>`, short: false},],
    };
  }).sort().reverse();

  const response = {
    response_type: 'in_channel',
    text: 'PRs à review pour ' + label,
    attachments
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
  const octokit = new Octokit({ auth: settings.github.token });
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
  const { repos } = new Octokit({ auth: settings.github.token });
  const { data } = await repos.listTags({
    owner: repoOwner,
    repo: repoName,
  });
  return data;
}

async function getDefaultBranch(repoOwner, repoName) {
  const { repos } = new Octokit({ auth: settings.github.token });
  const { data } = await repos.get({
    owner: repoOwner,
    repo: repoName,
  });
  return data.default_branch;
}

async function _getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName) {
  const defaultBranch = await getDefaultBranch(repoOwner, repoName);
  const { pulls } = new Octokit({ auth: settings.github.token });
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
  const { request } = new Octokit({ auth: settings.github.token });
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
    const pullRequests = await getDataFromGithub(label);
    return createResponseForSlack(pullRequests, label);
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
    const octokit = new Octokit({ auth: settings.github.token });
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
