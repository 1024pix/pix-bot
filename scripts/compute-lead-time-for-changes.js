require('dotenv').config();
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const githubService = require('../common/services/github');
const {getTagReleaseDate} = require('../common/services/changelog');
const ScalingoClient = require('../common/services/scalingo-client');
const dayjs = require('dayjs');


async function getLeadTimeForChanges(deploymentDate) {
  const octokit = githubService.createOctokit();
  const repoOwner = '1024pix';
  const repoName = 'pix';

  // const dateOfLastRelease1 = await getTagReleaseDate(repoOwner, repoName, 'v3.271.0');
  // const dateOfLastRelease2 = await getTagReleaseDate(repoOwner, repoName, 'v3.272.0');
  const dateOfLastRelease1 = '2022-10-10T14:10:40Z';
  const dateOfLastRelease2 = '2022-10-11T13:03:11Z';
  const pullRequests = await githubService.getMergedPullRequestsSortedByDescendingDate(repoOwner, repoName, 'dev');
  const filteredPullRequests = pullRequests.filter((PR) => PR.merged_at > dateOfLastRelease1 && PR.merged_at < dateOfLastRelease2);

  const firstCommitDates = await Promise.all(filteredPullRequests.map(async (pullRequest) => {
    const { data: commits } = await octokit.request(`GET ${pullRequest.commits_url}`);
    return commits.map((commit) => commit.commit.author.date).sort((a,b) => new Date(a) - new Date(b)).shift();
  }));
  return firstCommitDates.map((date) => {
    return new dayjs(deploymentDate).diff(date, 'day');
  });
}
async function main() {
  const scalingoClient = await ScalingoClient.getInstance('recette');
  const { deployments } = await scalingoClient.getDeployments('pix-api-recette');

  const { finished_at: deploymentDate } = deployments.find((deployment) => deployment.git_ref === 'v3.272.0');
  const leadTimeForChanges = await getLeadTimeForChanges(deploymentDate);
  console.log(leadTimeForChanges);
}

main();