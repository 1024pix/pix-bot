import * as releasesService from '../../common/services/releases';

async function deploy(repoName, appNamesList, releaseTag) {
  const environment = 'production';
  await Promise.all(
    appNamesList.map((appName) => releasesService.deployPixRepo(repoName, appName, releaseTag, environment)),
  );
  return releaseTag;
}

export { deploy };
