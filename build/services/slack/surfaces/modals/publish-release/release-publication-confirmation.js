const { Modal, Blocks } = require('slack-block-builder');

const callbackId = 'release-publication-confirmation';

module.exports = (releaseType, hasConfigFileChanged) => {
  const modal = Modal({
    title: 'Confirmation',
    callbackId,
    privateMetaData: releaseType,
    submit: '🚀 Go !',
    close: 'Annuler'
  }).blocks([
    ...hasConfigFileChanged ? [Blocks.Section({
      text: ':warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d\'environnement sont bien à jour sur *Scalingo RECETTE*.'
    })] : [],
    Blocks.Section({
      text: `Vous vous apprêtez à publier une version *${releaseType}* et la déployer en recette. Êtes-vous sûr de vous ?`
    })
  ]);
  return {
    response_action: 'push',
    view: modal.buildToObject()
  };
};

module.exports.callbackId = callbackId;
