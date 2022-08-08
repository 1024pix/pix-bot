const { Modal, Blocks } = require('slack-block-builder');

const callbackId = 'release-deployment-confirmation';

function modal(releaseTag, hasConfigFileChanged) {
  return Modal({
    title: 'Confirmation',
    callbackId,
    privateMetaData: releaseTag,
    submit: '🚀 Go !',
    close: 'Annuler',
  }).blocks([
    ...(hasConfigFileChanged
      ? [
          Blocks.Section({
            text: ":warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo PRODUCTION*.",
          }),
        ]
      : []),
    Blocks.Section({
      text: `Vous vous apprêtez à déployer la version *${releaseTag}* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?`,
    }),
  ]);
}

module.exports = (releaseTag, hasConfigFileChanged) => {
  return {
    response_action: 'push',
    view: modal(releaseTag, hasConfigFileChanged).buildToObject(),
  };
};

module.exports.sampleView = () => {
  return modal('v6.6.6', true);
};

module.exports.callbackId = callbackId;
