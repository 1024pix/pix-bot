const githubServices = require('../../common/services/github');
const releasesService = require('../../common/services/releases');

async function deploy(repoName, appNamesList) {
  const releaseTag = await githubServices.getLatestReleaseTag(repoName);
  const environment = 'production';
  await Promise.all(appNamesList.map((appName) => releasesService.deployPixRepo(repoName, appName, releaseTag, environment)));
  return releaseTag;
}

module.exports = {
  deploy,
};
