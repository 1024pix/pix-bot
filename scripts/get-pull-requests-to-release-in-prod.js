#! /usr/bin/env node
const fs = require('fs');

const github = require('../common/services/github');
const {
  getLastMEPDate,
  filterPullRequest,
  getNewChangeLogLines,
  getHeadOfChangelog,
  generateChangeLogContent,
} = require('../common/services/changelog');

const CHANGELOG_FILE = 'CHANGELOG.md';

async function main() {
  const tagVersion = process.argv[2];
  const repoOwner = process.argv[3];
  const repoName = process.argv[4];
  const branchName = process.argv[5];

  try {
    const dateOfLastMEP = await getLastMEPDate(repoOwner, repoName);

    const pullRequests = await github.getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, branchName);

    const pullRequestsSinceLastMEP = filterPullRequest(pullRequests, dateOfLastMEP);

    const newChangeLogLines = getNewChangeLogLines({
      headOfChangelogTitle: getHeadOfChangelog(tagVersion),
      pullRequests: pullRequestsSinceLastMEP,
    });

    let currentChangeLog = '';

    try {
      currentChangeLog = fs.readFileSync(CHANGELOG_FILE, 'utf-8').split('\n');
    } catch(error) {
      console.log('Changelog file does not exist. It will be created.');
      currentChangeLog = [`# ${repoName} Changelog\n`, '\n'];
    }

    const changeLogContent = generateChangeLogContent({
      currentChangelogContent: currentChangeLog,
      changes: newChangeLogLines
    });

    console.log(`Writing to ${CHANGELOG_FILE}`);
    fs.writeFileSync(CHANGELOG_FILE, changeLogContent.join('\n'));
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
}

main();
