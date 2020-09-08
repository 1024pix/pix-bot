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

function createResponseForSlack(pullRequests, label) {
  const resp = {
    response_type: 'in_channel',
    text: 'PRs à review pour ' + label,
    attachments: []
  };
  pullRequests.forEach((prs) => {
    resp.attachments.push({
      color: color[label],
      pretext: '',
      fields: [
        { value: `<${prs.html_url}|${prs.title}>`, short: false },
      ],
    });
  });
  return resp;
}

async function getLatestRelease(repoOwner, repo) {
  const { repos } = new Octokit({ auth: settings.github.token });
  const latestReleases = await repos.listTags({
    owner: repoOwner,
    repo,
  });
  return latestReleases.data[0];
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
    return data;
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
  }

};
