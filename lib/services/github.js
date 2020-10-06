const { Octokit } = require('@octokit/rest');
const axios = require('axios');
const settings = require('../config');

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

async function getLatestRelease(repoOwner, repo) {
  const tags = await getTags(repoOwner, repo);
  return tags[0];
}

async function getTags(repoOwner, repo) {
  const { repos } = new Octokit({ auth: settings.github.token });
  const { data } = await repos.listTags({
    owner: repoOwner,
    repo,
  });
  return data;
}

module.exports = {

  async getPullRequests(label) {
    const pullRequests = await getDataFromGithub(label);
    return createResponseForSlack(pullRequests, label);
  },

  async getLatestReleaseTag(repo = settings.github.repository) {
    const latestReleaseTag = await getLatestRelease(settings.github.owner, repo);
    return latestReleaseTag.name;
  },

  async getLatestReleaseTagUrl(repoOwner, repo = settings.github.repository) {
    const latestReleaseTag = await getLatestRelease(repoOwner, repo);
    return latestReleaseTag.commit.url;
  },

  async getCommitAtURL(commitUrl) {
    const { request } = new Octokit({ auth: settings.github.token });
    const { data } = await request(commitUrl);
    return data.commit;
  },

  async getMergedPullRequestsSortedByDescendingDate(owner, repo) {
    const { pulls } = new Octokit({ auth: settings.github.token });
    const { data } = await pulls.list({
      owner,
      repo,
      state: 'closed',
      sort: 'updated',
      direction: 'desc'
    });
    return data;
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
  }

};
