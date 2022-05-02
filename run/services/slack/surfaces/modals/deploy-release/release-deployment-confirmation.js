const { Modal, Blocks } = require('slack-block-builder');

const callbackId = 'release-deployment-confirmation';

module.exports = (releaseTag, hasConfigFileChanged) => {
  const modal = Modal({
    title: 'Confirmation',
    callbackId,
    privateMetaData: releaseTag,
    submit: '🚀 Go !',
    close: 'Annuler'
  }).blocks([
    ...hasConfigFileChanged ? [
      Blocks.Section({
        text: ':warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d\'environnement sont bien à jour sur *Scalingo PRODUCTION*.'
      })
    ] : [],
    Blocks.Section({
      text: `Vous vous apprêtez à déployer la version *${releaseTag}* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?`
    })
  ]);
  return {
    response_action: 'push',
    view: modal.buildToObject()
  };
};

module.exports.callbackId = callbackId;
