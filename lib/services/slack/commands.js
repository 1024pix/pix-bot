const { releaseAndDeployPixSite } = require('../releases');
const axios = require('axios');

module.exports = {

  async createAndDeployPixSiteRelease(payload) {
    await releaseAndDeployPixSite(payload.text);
    const options = {
      method: 'POST',
      url: payload.response_url,
      headers: {
        'content-type': 'application/json',
      },
      data: {
        "text": `Le script de déploiement de la release ${payload.text} en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`
      }
    };
    axios(options);
  }
};
