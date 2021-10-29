const { deploy } = require('../deploy');
const {
  PIX_REPO_NAME,
  PIX_APPS,
  PIX_APPS_ENVIRONMENTS,
  PIX_SITE_REPO_NAME,
  PIX_SITE_APPS,
  PIX_BOT_REPO_NAME,
  PIX_DATAWAREHOUSE_REPO_NAME,
  PIX_DATAWAREHOUSE_APPS_NAME,
  PIX_LCMS_REPO_NAME,
  PIX_LCMS_APP_NAME,
  PIX_UI_REPO_NAME,
  PIX_EMBER_TESTING_LIBRARY_REPO_NAME,
} = require('../../../config');
const releasesService = require('../../../common/services/releases');
const ScalingoClient = require('../../../common/services/scalingo-client');
const githubServices = require('../../../common/services/github');
const axios = require('axios');
const postSlackMessage = require('../../../common/services/slack/surfaces/messages/post-message');

function sendResponse(responseUrl, text) {
  axios.post(responseUrl,
    { text },
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}

function getErrorReleaseMessage(release, appName) {
  return `Erreur lors du déploiement de la release '${release}' pour ${appName} en production.`;
}

function getSuccessMessage(release, appName) {
  return `Le script de déploiement de la release '${release}' pour ${appName} en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`;
}

function getSuccessReleaseMessage(release, libName) {
  return `Le script de déploiement de la release '${release}' pour ${libName} s'est déroulé avec succès.`;
}

function getErrorAppMessage(appName) {
  return `Erreur lors du déploiement de ${appName} en production.`;
}

function _isReleaseTypeInvalid(releaseType) {
  return !['major', 'minor', 'patch'].includes(releaseType);
}

async function createPixUIGitHubRelease(repoName, appName, releaseType, responseUrl, typeErrorMessage) {
  if (_isReleaseTypeInvalid(releaseType)) {
    postSlackMessage(typeErrorMessage);
    throw new Error(typeErrorMessage);
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTagAfterRelease = await githubServices.getLatestReleaseTag(repoName);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    postSlackMessage(`[${appName}] App deployed (${releaseTagAfterRelease})`);
    sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, repoName));
  }
}

async function createEmberTestingLibraryGitHubRelease(repoName, appName, releaseType, responseUrl, typeErrorMessage) {
  if (_isReleaseTypeInvalid(releaseType)) {
    postSlackMessage(typeErrorMessage);
    throw new Error(typeErrorMessage);
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTagAfterRelease = await githubServices.getLatestReleaseTag(repoName);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    postSlackMessage(`[${appName}] Lib deployed (${releaseTagAfterRelease})`);
    sendResponse(responseUrl, getSuccessReleaseMessage(releaseTagAfterRelease, repoName));
  }
}

async function publishAndDeployRelease(repoName, appNamesList = [], releaseType, responseUrl) {
  try {
    if (_isReleaseTypeInvalid(releaseType)) {
      releaseType = 'minor';
    }
    await releasesService.publishPixRepo(repoName, releaseType);
    const releaseTag = await deploy(repoName, appNamesList);

    sendResponse(responseUrl, getSuccessMessage(releaseTag, appNamesList.join(', ')));
  } catch (e) {
    sendResponse(responseUrl, getErrorAppMessage(appNamesList.join(', ')));
  }
}

async function publishAndDeployPixBot(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTag = await githubServices.getLatestReleaseTag(repoName);

  const recette = await ScalingoClient.getInstance('recette');
  await recette.deployFromArchive('pix-bot-build', releaseTag, repoName, { withEnvSuffix: false });

  const production = await ScalingoClient.getInstance('production');
  await production.deployFromArchive('pix-bot-run', releaseTag, repoName);

  sendResponse(responseUrl, `Pix Bot deployed (${releaseTag})`);
}

async function getAndDeployLastVersion({ appName }) {
  const lastReleaseTag = await githubServices.getLatestReleaseTag(PIX_REPO_NAME);
  const sanitizedAppName = appName.trim().toLowerCase();

  const appNameParts = sanitizedAppName.split('-');
  const environment = appNameParts[appNameParts.length - 1];

  if (!_isAppFromPixRepo({ appName: sanitizedAppName })) {
    throw Error('L‘application doit faire partie du repo Pix');
  }

  const shortAppName = appNameParts[0] + '-' + appNameParts[1];
  await releasesService.deployPixRepo(PIX_REPO_NAME, shortAppName, lastReleaseTag, environment);
}

function _isAppFromPixRepo({ appName }) {
  const appNameParts = appName.split('-');

  if(appNameParts.length != 3) {
    return false;
  }

  const [appNamePrefix, shortAppName, environment] = appName.split('-');

  return appNamePrefix === 'pix'
    && PIX_APPS.includes(shortAppName)
    && PIX_APPS_ENVIRONMENTS.includes(environment);
}

module.exports = {

  async createAndDeployPixLCMS(payload) {
    await publishAndDeployRelease(PIX_LCMS_REPO_NAME, [PIX_LCMS_APP_NAME], payload.text, payload.response_url);
  },

  async createPixUIRelease(payload) {
    const appName = 'PIX-UI';
    const typeErrorMessage = 'Erreur lors du choix de la nouvelle version de Pix UI. Veuillez indiquer "major", "minor" ou "patch".';
    await createPixUIGitHubRelease(PIX_UI_REPO_NAME, appName, payload.text, payload.response_url, typeErrorMessage);
  },

  async createEmberTestingLibraryRelease(payload) {
    const appName = 'EMBER-TESTING-LIBRARY';
    const typeErrorMessage = 'Erreur lors du choix de la nouvelle version d\'ember-testing-library. Veuillez indiquer "major", "minor" ou "patch".';
    await createEmberTestingLibraryGitHubRelease(PIX_EMBER_TESTING_LIBRARY_REPO_NAME, appName, payload.text, payload.response_url, typeErrorMessage);
  },

  async createAndDeployPixSiteRelease(payload) {
    await publishAndDeployRelease(PIX_SITE_REPO_NAME, PIX_SITE_APPS, payload.text, payload.response_url);
  },

  async createAndDeployPixDatawarehouse(payload) {
    await publishAndDeployRelease(PIX_DATAWAREHOUSE_REPO_NAME, PIX_DATAWAREHOUSE_APPS_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixBotRelease(payload) {
    await publishAndDeployPixBot(PIX_BOT_REPO_NAME, payload.text, payload.response_url);
  },

  async getAndDeployLastVersion({ appName }) {
    await getAndDeployLastVersion({ appName });
  }

};
