const { deploy, publish, createAndDeployPixSite } = require('../releases');
const axios = require('axios');

module.exports = {

  publishRelease(payload) {
    publish(payload.text).then(() => {
      const options = {
        method: 'POST',
        url: payload.response_url,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          "text": `Le script de publication de la release ${payload.text} s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`
        }
      };
      axios(options);
    });
  },

  deployRelease(payload) {
    deploy(payload.text).then(() => {
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
    });
  },

  createAndDeployPixSiteRelease(payload) {
    createAndDeployPixSite(payload.text).then(() => {
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
    });
  }
};
