const { releaseAndDeployPixBotTest } = require('../releases');
const releasesService = require('../releases');
const githubServices = require('../github');
const axios = require('axios');

const PIX_SITE_APP_NAME = 'pix-site';
const PIX_SITE_REPO_NAME = 'pix-site';
const PIX_PRO_APP_NAME = 'pix-pro';
const PIX_PRO_REPO_NAME = 'pix-site-pro';

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

function getResponseText(release, appName) {
  return `Le script de déploiement de la release '${release}' pour ${appName} en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`;
}

async function publishAndDeployRelease(repoName, appName, releaseType, responseUrl) {
  await releasesService.publishPixSite(repoName, releaseType);
  const releaseTag = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.deployPixSite(repoName, appName, releaseTag);

  sendResponse(responseUrl, getResponseText(releaseTag, appName));
}

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await publishAndDeployRelease(PIX_SITE_REPO_NAME, PIX_SITE_APP_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixProRelease(payload) {
    await publishAndDeployRelease(PIX_PRO_REPO_NAME, PIX_PRO_APP_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixBotTestRelease(payload) {
    await releaseAndDeployPixBotTest(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, getResponseText(release, 'PIX TEST (repo de test)'));
  }
};
