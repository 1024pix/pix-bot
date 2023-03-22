const releasesService = require('../../common/services/releases');

async function deploy(repoName, appNamesList, releaseTag) {
  const environment = 'production';
  await Promise.all(
    appNamesList.map((appName) => releasesService.deployPixRepo(repoName, appName, releaseTag, environment))
  );
  return releaseTag;
}

module.exports = {
  deploy,
};
