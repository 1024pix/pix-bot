#! /usr/bin/env node

/* eslint no-console: off */

const fs = require('fs');

const github = require('../common/services/github');
const {
  getTagReleaseDate,
  filterPullRequest,
  getNewChangeLogLines,
  getHeadOfChangelog,
  generateChangeLogContent,
} = require('../common/services/changelog');

const CHANGELOG_FILE = 'CHANGELOG.md';

async function pullRequestSinceLastRelease(repoOwner, repoName, lastTagNameOnBranch, branchName) {
  const dateOfLastRelease = await getTagReleaseDate(repoOwner, repoName, lastTagNameOnBranch);

  const pullRequests = await github.getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, branchName);
  return filterPullRequest(pullRequests, dateOfLastRelease);
}

async function main() {
  const tagVersion = process.argv[2];
  const repoOwner = process.argv[3];
  const repoName = process.argv[4];
  const branchName = process.argv[5];
  const lastTagNameOnBranch = process.argv[6];

  try {
    let pullRequests;
    if (lastTagNameOnBranch === 'v0.0.0') {
      pullRequests = await github.getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, branchName);
    } else {
      try {
        pullRequests = await pullRequestSinceLastRelease(repoOwner, repoName, lastTagNameOnBranch, branchName);
      } catch (e) {
        console.error(
          "Error while fetching the tag and pull-requests. If it's your first release, ensure that the version set is 0.0.0.",
        );
        throw e;
      }
    }

    const newChangeLogLines = getNewChangeLogLines({
      headOfChangelogTitle: getHeadOfChangelog(tagVersion),
      pullRequests,
    });

    let currentChangeLog = '';

    try {
      currentChangeLog = fs.readFileSync(CHANGELOG_FILE, 'utf-8').split('\n');
    } catch (error) {
      console.log('Changelog file does not exist. It will be created.');
      currentChangeLog = [`# ${repoName} Changelog\n`, '\n'];
    }

    const changeLogContent = generateChangeLogContent({
      currentChangelogContent: currentChangeLog,
      changes: newChangeLogLines,
    });

    console.log(`Writing to ${CHANGELOG_FILE}`);
    fs.writeFileSync(CHANGELOG_FILE, changeLogContent.join('\n'));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

main();
