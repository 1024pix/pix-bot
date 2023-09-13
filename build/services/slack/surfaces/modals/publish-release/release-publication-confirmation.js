const { Modal, Blocks } = require('slack-block-builder');

const callbackId = 'release-publication-confirmation';

function modal({ releaseType, hasConfigFileChanged, latestTag }) {
  return Modal({
    title: 'Confirmation',
    callbackId,
    privateMetaData: releaseType,
    submit: '🚀 Go !',
    close: 'Annuler',
  }).blocks([
    ...(hasConfigFileChanged
      ? [
          Blocks.Section({
            text: `:warning: Il y a eu des ajout(s)/suppression(s) dans le fichier [config.js](https://github.com/1024pix/pix/compare/${latestTag}...dev). Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.`,
          }),
        ]
      : []),
    Blocks.Section({
      text: `Vous vous apprêtez à publier une version *${releaseType}* et la déployer en recette. Êtes-vous sûr de vous ?`,
    }),
  ]);
}

module.exports = (releaseType, hasConfigFileChanged, latestTag) => {
  return {
    response_action: 'push',
    view: modal({ releaseType, hasConfigFileChanged, latestTag }).buildToObject(),
  };
};

module.exports.sampleView = () => {
  return modal({ releaseType: 'minor', hasConfigFileChanged: true, latestTag: 'v4.0.0' });
};

module.exports.callbackId = callbackId;
