import { release } from '../../common/services/releases.js';

async function deploy(repoName, appNamesList, releaseTag) {
  const environment = 'production';
  await Promise.all(appNamesList.map((appName) => release.deployPixRepo(repoName, appName, releaseTag, environment)));
  return releaseTag;
}

export { deploy };
