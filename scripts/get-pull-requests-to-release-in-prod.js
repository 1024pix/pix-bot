#! /usr/bin/env node
const axios = require('axios');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');

const CHANGELOG_FILE = 'CHANGELOG.md';
const CHANGELOG_HEADER_LINES = 2;

function buildRequestObject(repoOwner, repoName) {
  return `https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=closed&sort=updated&direction=desc'`
}

function getTheCommitDate(RawDataCommit) {
  return RawDataCommit.commit.committer.date;
}

async function getLastMEPDate(repoOwner, repoName) {
  const tags = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/tags`);
  const commitUrl = tags.data[0].commit.url;

  const commit = await axios.get(commitUrl);
  return getTheCommitDate(commit.data);
}

function displayPullRequest(pr) {
  return `- [#${pr.number}](${pr.html_url}) ${pr.title}`;
}

function orderPr(listPR) {
  const typeOrder = ['FEATURE', 'QUICK WIN', 'BUGFIX', 'TECH'];
  return _.sortBy(listPR, (pr) => {
    const typeOfPR = pr.title.substring(1, pr.title.indexOf(']'));
    const typeIndex = _.indexOf(typeOrder, typeOfPR);
    return typeIndex < 0 ? Number.MAX_VALUE : typeIndex;
  });
}

function filterPullRequest(pullrequests, dateOfLastMEP) {
  return pullrequests.filter((PR) => PR.merged_at > dateOfLastMEP);
}

function getHeadOfChangelog(tagVersion) {
  const date = ' (' + moment().format('DD/MM/YYYY') + ')';
  return '## v' + tagVersion + date + '\n';
}

async function main() {
  const tagVersion = process.argv[2];
  const repoOwner = process.argv[3];
  const repoName = process.argv[4];

  try {
    const dateOfLastMEP = await getLastMEPDate(repoOwner, repoName);

    const { data: pullRequests } = await axios(buildRequestObject(repoOwner, repoName));

    const newChangeLogLines = [];

    newChangeLogLines.push(getHeadOfChangelog(tagVersion));
    const pullRequestsSinceLastMEP = filterPullRequest(pullRequests, dateOfLastMEP);

    const orderedPR = orderPr(pullRequestsSinceLastMEP);
    newChangeLogLines.push(...orderedPR.map(displayPullRequest));
    newChangeLogLines.push('');


    let currentChangeLog = '';

    try {
      currentChangeLog = fs.readFileSync(CHANGELOG_FILE, 'utf-8').split('\n');
    } catch(error) {
      console.log('Changelog file does not exist. It will be created.');
    }

    currentChangeLog.splice(CHANGELOG_HEADER_LINES, 0, ...newChangeLogLines);

    console.log(`Writing to ${CHANGELOG_FILE}`);

    fs.writeFileSync(CHANGELOG_FILE, currentChangeLog.join('\n'));
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
}

/*=================== tests =============================*/

if (process.env.NODE_ENV !== 'test') {
  main();
} else {
  module.exports = {
    displayPullRequest,
    filterPullRequest,
    orderPr,
    getHeadOfChangelog,
    getTheCommitDate,
    getLastMEPDate,
  };
}
