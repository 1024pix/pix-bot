const { releaseAndDeployPixBotTest } = require('../../../lib/services/releases');
const releasesServiceFromBuild = require('../../../build/services/releases');
const releasesServiceFromRun = require('../../../run/services/releases');
const githubServices = require('../github');
const axios = require('axios');

const PIX_DATAWAREHOUSE_REPO_NAME = 'pix-db-replication';
const PIX_DATAWAREHOUSE_APPS_NAME = ['pix-datawarehouse', 'pix-datawarehouse-ex'];

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

function getSuccessMessage(release, appName) {
  return `Le script de déploiement de la release '${release}' pour ${appName} en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`;
}

function getErrorAppMessage(appName) {
  return `Erreur lors du déploiement de ${appName} en production.`;
}

function _isReleaseTypeInvalid(releaseType) {
  return !['major', 'minor', 'patch'].includes(releaseType);
}

async function publishAndDeployRelease(repoName, appNamesList = [], releaseType, responseUrl) {
  try {
    if (_isReleaseTypeInvalid(releaseType)) {
      releaseType = 'minor';
    }
    await releasesServiceFromBuild.publishPixRepo(repoName, releaseType);
    const releaseTag = await githubServices.getLatestReleaseTag(repoName);

    await Promise.all(appNamesList.map((appName) => releasesServiceFromRun.deployPixRepo(repoName, appName, releaseTag)));

    sendResponse(responseUrl, getSuccessMessage(releaseTag, appNamesList.join(', ')));
  } catch (e) {
    sendResponse(responseUrl, getErrorAppMessage(appNamesList.join(', ')));
  }
}

module.exports = {

  async createAndDeployPixDatawarehouse(payload) {
    await publishAndDeployRelease(PIX_DATAWAREHOUSE_REPO_NAME, PIX_DATAWAREHOUSE_APPS_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixBotTestRelease(payload) {
    await releaseAndDeployPixBotTest(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, getSuccessMessage(release, 'PIX TEST (repo de test)'));
  }
};
