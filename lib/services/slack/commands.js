const { releaseAndDeployPixSite, releaseAndDeployPixPro, releaseAndDeployPixBotTest } = require('../releases');
const axios = require('axios');

function sendResponse(payload, text) {
  const options = {
    method: 'POST',
    url: payload.response_url,
    headers: {
      'content-type': 'application/json',
    },
    data: {
      text
    }
  };
  axios(options);
}

function getResponseText(release, appName) {
  return `Le script de déploiement de la release '${release}' pour ${appName} en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`;
}

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await releaseAndDeployPixSite(payload.text);
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
