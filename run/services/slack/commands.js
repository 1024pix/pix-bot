const releasesService = require('../releases');
const githubServices = require('../../../common/services/github');
const axios = require('axios');

const PIX_SITE_REPO_NAME = 'pix-site';
const PIX_SITE_APPS = ['pix-site', 'pix-pro'];

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
    await releasesService.publishPixRepo(repoName, releaseType);
    const releaseTag = await githubServices.getLatestReleaseTag(repoName);

    await Promise.all(appNamesList.map((appName) => releasesService.deployPixRepo(repoName, appName, releaseTag)));

    sendResponse(responseUrl, getSuccessMessage(releaseTag, appNamesList.join(', ')));
  } catch (e) {
    sendResponse(responseUrl, getErrorAppMessage(appNamesList.join(', ')));
  }
}

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await publishAndDeployRelease(PIX_SITE_REPO_NAME, PIX_SITE_APPS, payload.text, payload.response_url);
  },

};
