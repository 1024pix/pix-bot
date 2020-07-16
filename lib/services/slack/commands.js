const { releaseAndDeployPixBotTest } = require('../releases');
const releasesService = require('../releases');
const githubServices = require('../github');
const axios = require('axios');

function sendResponse(payload, text) {
  axios.post(payload.response_url, 
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

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await releasesService.publishPixSite(payload.text);
    const releaseTag = await githubServices.getLatestReleaseTag('pix-site');
    await releasesService.deployPixSite(releaseTag);

    const release = payload.text || 'defaut';
    sendResponse(payload, getResponseText(release, 'PIX site'));
  },

  async createAndDeployPixProRelease(payload) {
    await releaseAndDeployPixBotTest(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, getResponseText(release, 'PIX pro'));
  },

  async createAndDeployPixBotTestRelease(payload) {
    await releaseAndDeployPixBotTest(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, getResponseText(release, 'PIX TEST (repo de test)'));
  }
};
