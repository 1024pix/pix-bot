const { deploy } = require('../deploy');
const {
  PIX_REPO_NAME,
  PIX_APPS,
  PIX_APPS_ENVIRONMENTS,
  PIX_SITE_REPO_NAME,
  PIX_SITE_APPS,
  PIX_BOT_REPO_NAME,
  PIX_BOT_APPS,
  PIX_DATAWAREHOUSE_REPO_NAME,
  PIX_DATAWAREHOUSE_APPS_NAME,
  PIX_LCMS_REPO_NAME,
  PIX_LCMS_APPS,
  PIX_UI_REPO_NAME,
  PIX_EMBER_TESTING_LIBRARY_REPO_NAME,
  PIX_DB_STATS_REPO_NAME,
  PIX_DB_STATS_APPS_NAME,
  PIX_METABASE_REPO_NAME,
  PIX_METABASE_APPS_NAME,
  PIX_TUTOS_REPO_NAME,
  PIX_TUTOS_APP_NAME,
  PIX_GRAVITEE_APIM_REPO_NAME,
  PIX_GRAVITEE_APIM_APPS_NAME,
  PIX_AIRFLOW_APP_NAME,
  PIX_360_REPO_NAME,
  PIX_360_APP_NAME,
} = require('../../../config');
const releasesService = require('../../../common/services/releases');
const ScalingoClient = require('../../../common/services/scalingo-client');
const githubServices = require('../../../common/services/github');
const axios = require('axios');
const slackPostMessageService = require('../../../common/services/slack/surfaces/messages/post-message');

function sendResponse(responseUrl, text) {
  axios.post(
    responseUrl,
    { text },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
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
async function publishAndDeployPixUI(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    slackPostMessageService.postMessage(
      'Erreur lors du choix de la nouvelle version de Pix UI. Veuillez indiquer "major", "minor" ou "patch".'
    );
    throw new Error(
      'Erreur lors du choix de la nouvelle version de Pix UI. Veuillez indiquer "major", "minor" ou "patch".'
    );
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTagAfterRelease = await githubServices.getLatestReleaseTag(repoName);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    slackPostMessageService.postMessage(`[PIX-UI] App deployed (${releaseTagAfterRelease})`);
    sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, repoName));
  }
}

async function publishAndDeployEmberTestingLibrary(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    slackPostMessageService.postMessage(
      'Erreur lors du choix de la nouvelle version d\'ember-testing-library. Veuillez indiquer "major", "minor" ou "patch".'
    );
    throw new Error(
      'Erreur lors du choix de la nouvelle version d\'ember-testing-library. Veuillez indiquer "major", "minor" ou "patch".'
    );
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTagAfterRelease = await githubServices.getLatestReleaseTag(repoName);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    slackPostMessageService.postMessage(`[EMBER-TESTING-LIBRARY] Lib deployed (${releaseTagAfterRelease})`);
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

async function publishAndDeployReleaseWithAppsByEnvironment(repoName, appsByEnv, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTag = await githubServices.getLatestReleaseTag(repoName);

  await Promise.all(
    Object.keys(appsByEnv).map(async (scalingoEnv) => {
      const scalingoInstance = await ScalingoClient.getInstance(scalingoEnv);

      await Promise.all(
        appsByEnv[scalingoEnv].map((scalingoAppName) => {
          return scalingoInstance.deployFromArchive(scalingoAppName, releaseTag, repoName, { withEnvSuffix: false });
        })
      );
    })
  );
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

  if (appNameParts.length != 3) {
    return false;
  }

  const [appNamePrefix, shortAppName, environment] = appName.split('-');

  return appNamePrefix === 'pix' && PIX_APPS.includes(shortAppName) && PIX_APPS_ENVIRONMENTS.includes(environment);
}

async function deployFromBranch(repoName, appNames, branch) {
  const client = await ScalingoClient.getInstance('production');
  return Promise.all(
    appNames.map((appName) => {
      return client.deployFromArchive(appName, branch, repoName, { withEnvSuffix: false });
    })
  );
}

async function deployTagUsingSCM(appNames, tag) {
  const client = await ScalingoClient.getInstance('production');
  return Promise.all(
    appNames.map((appName) => {
      return client.deployUsingSCM(appName, tag);
    })
  );
}

module.exports = {
  async deployAirflow(payload) {
    const version = payload.text;
    await deployTagUsingSCM([PIX_AIRFLOW_APP_NAME], version);
  },

  async deployGraviteeAPIM() {
    await deployFromBranch(PIX_GRAVITEE_APIM_REPO_NAME, PIX_GRAVITEE_APIM_APPS_NAME, 'main');
  },

  async deployPix360() {
    await deployFromBranch(PIX_360_REPO_NAME, [PIX_360_APP_NAME], 'main');
  },

  async createAndDeployPixLCMS(payload) {
    await publishAndDeployReleaseWithAppsByEnvironment(
      PIX_LCMS_REPO_NAME,
      PIX_LCMS_APPS,
      payload.text,
      payload.response_url
    );
  },

  async createAndDeployPixUI(payload) {
    await publishAndDeployPixUI(PIX_UI_REPO_NAME, payload.text, payload.response_url);
  },

  async createAndDeployEmberTestingLibrary(payload) {
    await publishAndDeployEmberTestingLibrary(PIX_EMBER_TESTING_LIBRARY_REPO_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixSiteRelease(payload) {
    await publishAndDeployRelease(PIX_SITE_REPO_NAME, PIX_SITE_APPS, payload.text, payload.response_url);
  },

  async createAndDeployPixDatawarehouse(payload) {
    await publishAndDeployRelease(
      PIX_DATAWAREHOUSE_REPO_NAME,
      PIX_DATAWAREHOUSE_APPS_NAME,
      payload.text,
      payload.response_url
    );
  },

  async createAndDeployPixBotRelease(payload) {
    await publishAndDeployReleaseWithAppsByEnvironment(
      PIX_BOT_REPO_NAME,
      PIX_BOT_APPS,
      payload.text,
      payload.response_url
    );
  },

  async getAndDeployLastVersion({ appName }) {
    await getAndDeployLastVersion({ appName });
  },

  async createAndDeployDbStats(payload) {
    await publishAndDeployRelease(PIX_DB_STATS_REPO_NAME, PIX_DB_STATS_APPS_NAME, payload.text, payload.response_url);
  },

  async deployMetabase() {
    await deployFromBranch(PIX_METABASE_REPO_NAME, PIX_METABASE_APPS_NAME, 'master');
  },

  async createAndDeployPixTutosRelease(payload) {
    await publishAndDeployRelease(PIX_TUTOS_REPO_NAME, [PIX_TUTOS_APP_NAME], payload.text, payload.response_url);
  },
};
