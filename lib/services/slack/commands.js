const { releaseAndDeployPixBotTest } = require('../releases');
const releasesService = require('../releases');
const githubServices = require('../github');
const axios = require('axios');
const postSlackMessage = require('../../services/slack/surfaces/messages/post-message');

const PIX_SITE_REPO_NAME = 'pix-site';
const PIX_SITE_APPS = ['pix-site', 'pix-pro'];
const PIX_UI_REPO_NAME = 'pix-ui';
const PIX_LCMS_REPO_NAME = 'pix-editor';
const PIX_LCMS_APP_NAME = 'pix-lcms';

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

function getErrorMessage(release, appName) {
  return `Erreur lors du déploiement de la release '${release}' pour ${appName} en production.`;
}

function _isReleaseTypeInvalid(releaseType) {
  return !['major', 'minor', 'patch'].includes(releaseType);
}

async function publishAndDeployRelease(repoName, appNamesList = [], releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTag = await githubServices.getLatestReleaseTag(repoName);

  await Promise.all(appNamesList.map((appName) => releasesService.deployPixRepo(repoName, appName, releaseTag)));

  sendResponse(responseUrl, getSuccessMessage(releaseTag, appNamesList.join(', ')));
}

async function publishAndDeployPixUI(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTagAfterRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.deployPixUI();

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorMessage(releaseTagAfterRelease, repoName));
  } else {
    sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, repoName));
    postSlackMessage(`[PIX-UI] App deployed (${releaseTagAfterRelease})`);
  }
}

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await publishAndDeployRelease(PIX_SITE_REPO_NAME, PIX_SITE_APPS, payload.text, payload.response_url);
  },

  async createAndDeployPixUI(payload) {
    await publishAndDeployPixUI(PIX_UI_REPO_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixLCMS(payload) {
    await publishAndDeployRelease(PIX_LCMS_REPO_NAME, [PIX_LCMS_APP_NAME], payload.text, payload.response_url);
  },

  async createAndDeployPixBotTestRelease(payload) {
    await releaseAndDeployPixBotTest(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, getSuccessMessage(release, 'PIX TEST (repo de test)'));
  }
};
