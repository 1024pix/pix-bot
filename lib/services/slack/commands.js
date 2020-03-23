const { deploy } = require('../releases');
const axios = require('axios');

module.exports = {

  deployRelease(payload) {
    deploy(payload.text).then(() => {
      const options = {
        method: 'POST',
        url: payload.response_url,
        headers: {
          'content-type': 'application/json',
        },
        data: {
          "text": `Le script de déploiement de la release ${payload.text} en production s'est déroulé avec succès. En attente de l'installation sur Scalingo…`
        }
      };
      axios(options);
    });
    return {
      "text": "Demande de déploiement en production bien reçue."
    };
  }

};
