const { releaseAndDeployPixSite } = require('../releases');
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

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await releaseAndDeployPixSite(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, `Le script de déploiement de la release '${release}' pour PIX site en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`);
  },

  async createAndDeployPixProRelease(payload) {
    await releaseAndDeployPixPro(payload.text);
    const release = payload.text || 'defaut';
    sendResponse(payload, `Le script de déploiement de la release ${release}' pour PIX pro en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`);
  }
};
