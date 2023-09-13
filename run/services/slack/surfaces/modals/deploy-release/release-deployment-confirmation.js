const { Modal, Blocks } = require('slack-block-builder');

const callbackId = 'release-deployment-confirmation';

function modal(releaseTag, hasConfigFileChanged, previousReleaseTag) {
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
            text: `:warning: Il y a eu des ajout(s)/suppression(s) dans le fichier [config.js](https://github.com/1024pix/pix/compare/${previousReleaseTag}...${releaseTag}). Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo PRODUCTION*.`,
          }),
        ]
      : []),
    Blocks.Section({
      text: `Vous vous apprêtez à déployer la version *${releaseTag}* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?`,
    }),
  ]);
}

module.exports = (releaseTag, hasConfigFileChanged, previousReleaseTag) => {
  return {
    response_action: 'push',
    view: modal(releaseTag, hasConfigFileChanged, previousReleaseTag).buildToObject(),
  };
};

module.exports.sampleView = () => {
  return modal('v6.6.6', true, 'v6.6.5');
};

module.exports.callbackId = callbackId;
