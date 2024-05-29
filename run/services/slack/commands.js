import axios from 'axios';

import githubServices from '../../../common/services/github.js';
import releasesService from '../../../common/services/releases.js';
import ScalingoClient from '../../../common/services/scalingo-client.js';
import slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message.js';
import { config } from '../../../config.js';
import { deploy } from '../deploy.js';

function sendResponse(responseUrl, text) {
  axios.post(
    responseUrl,
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

async function _publishPixUI(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  const releaseTagAfterRelease = await releasesService.publishPixRepo(repoName, releaseType);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    const message = `[PIX-UI] App deployed (${releaseTagAfterRelease})`;
    slackPostMessageService.postMessage({ message });
    sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, repoName));
  }
}

async function _publishAndDeployEmberTestingLibrary(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  const releaseTagAfterRelease = await releasesService.publishPixRepo(repoName, releaseType);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    const message = `[EMBER-TESTING-LIBRARY] Lib deployed (${releaseTagAfterRelease})`;
    slackPostMessageService.postMessage({ message });
    sendResponse(responseUrl, getSuccessReleaseMessage(releaseTagAfterRelease, repoName));
  }
}

async function _publishAndDeployRelease(repoName, appNamesList = [], releaseType, responseUrl) {
  try {
    if (_isReleaseTypeInvalid(releaseType)) {
      releaseType = 'minor';
    }
    const releaseTagAfterRelease = await releasesService.publishPixRepo(repoName, releaseType);
    await deploy(repoName, appNamesList, releaseTagAfterRelease);

    sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, appNamesList.join(', ')));
  } catch (e) {
    sendResponse(responseUrl, getErrorAppMessage(appNamesList.join(', ')));
  }
}

async function _publishAndDeployReleaseWithAppsByEnvironment(repoName, appsByEnv, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }

  const releaseTagAfterRelease = await releasesService.publishPixRepo(repoName, releaseType);

  await Promise.all(
    Object.keys(appsByEnv).map(async (scalingoEnv) => {
      const scalingoInstance = await ScalingoClient.getInstance(scalingoEnv);

      await Promise.all(
        appsByEnv[scalingoEnv].map((scalingoAppName) => {
          return scalingoInstance.deployFromArchive(scalingoAppName, releaseTagAfterRelease, repoName, {
            withEnvSuffix: false,
          });
        }),
      );
    }),
  );
  sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, Object.values(appsByEnv).join(', ')));
}

async function _getAndDeployLastVersion({ appName }) {
  const lastReleaseTag = await githubServices.getLatestReleaseTag(config.PIX_REPO_NAME);
  const sanitizedAppName = appName.trim().toLowerCase();

  const appNameParts = sanitizedAppName.split('-');
  const environment = appNameParts[appNameParts.length - 1];

  if (!_isAppFromPixRepo({ appName: sanitizedAppName })) {
    throw Error('L‘application doit faire partie du repo Pix');
  }

  const shortAppName = appNameParts[0] + '-' + appNameParts[1];
  await releasesService.deployPixRepo(config.PIX_REPO_NAME, shortAppName, lastReleaseTag, environment);
}

function _isAppFromPixRepo({ appName }) {
  const appNameParts = appName.split('-');

  if (appNameParts.length != 3) {
    return false;
  }

  const [appNamePrefix, shortAppName, environment] = appName.split('-');

  return (
    appNamePrefix === 'pix' &&
    config.PIX_APPS.includes(shortAppName) &&
    config.PIX_APPS_ENVIRONMENTS.includes(environment)
  );
}

async function deployTagUsingSCM(appNames, tag) {
  const client = await ScalingoClient.getInstance('production');
  return Promise.all(
    appNames.map((appName) => {
      return client.deployUsingSCM(appName, tag);
    }),
  );
}

async function deployAirflow(payload) {
  const version = payload.text;
  await deployTagUsingSCM([config.PIX_AIRFLOW_APP_NAME], version);
}

async function deployDBT(payload) {
  const version = payload.text;
  await deployTagUsingSCM(config.PIX_DBT_APPS_NAME, version);
}

async function createAndDeployPixLCMS(payload) {
  await _publishAndDeployReleaseWithAppsByEnvironment(
    config.PIX_LCMS_REPO_NAME,
    config.PIX_LCMS_APPS,
    payload.text,
    payload.response_url,
  );
}

async function createAndDeployPixAPIData(payload) {
  await _publishAndDeployReleaseWithAppsByEnvironment(
    config.PIX_API_DATA_REPO_NAME,
    config.PIX_API_DATA_APPS,
    payload.text,
    payload.response_url,
  );
}

async function createAndDeployPixUI(payload) {
  await _publishPixUI(config.PIX_UI_REPO_NAME, payload.text, payload.response_url);
}

async function createAndDeployEmberTestingLibrary(payload) {
  await _publishAndDeployEmberTestingLibrary(
    config.PIX_EMBER_TESTING_LIBRARY_REPO_NAME,
    payload.text,
    payload.response_url,
  );
}

async function createAndDeployPixSiteRelease(payload) {
  await _publishAndDeployRelease(config.PIX_SITE_REPO_NAME, config.PIX_SITE_APPS, payload.text, payload.response_url);
}

async function createAndDeployPixDatawarehouse(payload) {
  await _publishAndDeployRelease(
    config.PIX_DATAWAREHOUSE_REPO_NAME,
    config.PIX_DATAWAREHOUSE_APPS_NAME,
    payload.text,
    payload.response_url,
  );
}

async function createAndDeployPixBotRelease(payload) {
  await _publishAndDeployReleaseWithAppsByEnvironment(
    config.PIX_BOT_REPO_NAME,
    config.PIX_BOT_APPS,
    payload.text,
    payload.response_url,
  );
}

async function getAndDeployLastVersion({ appName }) {
  await _getAndDeployLastVersion({ appName });
}

async function createAndDeployDbStats(payload) {
  await _publishAndDeployRelease(
    config.PIX_DB_STATS_REPO_NAME,
    config.PIX_DB_STATS_APPS_NAME,
    payload.text,
    payload.response_url,
  );
}

async function createAndDeployPixTutosRelease(payload) {
  await _publishAndDeployRelease(
    config.PIX_TUTOS_REPO_NAME,
    [config.PIX_TUTOS_APP_NAME],
    payload.text,
    payload.response_url,
  );
}

export {
  createAndDeployDbStats,
  createAndDeployEmberTestingLibrary,
  createAndDeployPixAPIData,
  createAndDeployPixBotRelease,
  createAndDeployPixDatawarehouse,
  createAndDeployPixLCMS,
  createAndDeployPixSiteRelease,
  createAndDeployPixTutosRelease,
  createAndDeployPixUI,
  deployAirflow,
  deployDBT,
  getAndDeployLastVersion,
};
