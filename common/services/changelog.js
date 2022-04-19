const moment = require('moment');
const { sortBy, indexOf } = require('lodash');
const github = require('./github');

const PartialChangeLogGenerator = require('../models/PartialChangeLogGenerator');
const PullRequest = require('../models/PullRequest');
const PullRequestGroupFactory = require('../models/PullRequestGroupFactory');

const CHANGELOG_HEADER_LINES = 2;

async function getLastMEPDate(repoOwner, repoName) {
  const latestTagUrl = await github.getLatestReleaseTagUrl(repoOwner, repoName);

  const commit = await github.getCommitAtURL(latestTagUrl);
  return commit.committer.date;
}

function displayPullRequest(pr) {
  return `- [#${pr.number}](${pr.html_url}) ${pr.title}`;
}

function orderPr(listPR) {
  const typeOrder = ['FEATURE', 'QUICK WIN', 'BUGFIX', 'TECH'];
  return sortBy(listPR, (pr) => {
    const typeOfPR = pr.title.substring(1, pr.title.indexOf(']'));
    const typeIndex = indexOf(typeOrder, typeOfPR);
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

function generateChangeLogContent({ currentChangelogContent, changes }) {
  const header = '# PIX Changelog\n';
  let newChangelogContent = currentChangelogContent;

  if (newChangelogContent.length === 0) {
    newChangelogContent = [header, '\n'];
  }

  newChangelogContent.splice(CHANGELOG_HEADER_LINES, 0, ...changes);
  return newChangelogContent;
}

function getNewChangeLogLines({ headOfChangelogTitle, pullRequests }) {
  const partialChangeLogGenerator = new PartialChangeLogGenerator({
    headOfChangelogTitle,
    pullRequestGroups: PullRequestGroupFactory.build(),
  });

  partialChangeLogGenerator.grabPullRequestsByTag(
    pullRequests.map((item) => new PullRequest(item))
  );
  return partialChangeLogGenerator.getLinesToDisplay();
}

module.exports = {
  displayPullRequest,
  filterPullRequest,
  generateChangeLogContent,
  getHeadOfChangelog,
  getLastMEPDate,
  getNewChangeLogLines,
  orderPr,
};
