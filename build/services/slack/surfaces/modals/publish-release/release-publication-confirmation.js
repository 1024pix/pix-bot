const { Modal, Blocks } = require('slack-block-builder');
const config = require('../../../../../../config');

const callbackId = 'release-publication-confirmation';

function modal(
  releaseType,
  hasConfigFileChanged,
  { pullRequestNumbers, teamLabels } = { pullRequestNumbers: [], teamLabels: [] },
) {
  return Modal({
    title: 'Confirmation',
    callbackId,
    privateMetaData: releaseType,
    submit: '🚀 Go !',
    close: 'Annuler',
  }).blocks([
    ...(hasConfigFileChanged
      ? [
          pullRequestNumbers.length > 0 && teamLabels.length > 0
            ? Blocks.Section({
                text: `:warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Voici les équipes qui semblent concernées : ${teamLabels.toLocaleString()}. À confirmer dans les PRs suivantes :\n- ${pullRequestNumbers
                  .map(
                    (pullRequestNumber) =>
                      '<https://github.com/' +
                      config.github.repoOwner +
                      '/' +
                      config.github.repoName +
                      '/pull/' +
                      pullRequestNumber +
                      '|PR #' +
                      pullRequestNumber +
                      '>',
                  )
                  .join(
                    '\n- ',
                  )}. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.`,
              })
            : Blocks.Section({
                text: ":warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.",
              }),
        ]
      : []),
    Blocks.Section({
      text: `Vous vous apprêtez à publier une version *${releaseType}* et la déployer en recette. Êtes-vous sûr de vous ?`,
    }),
  ]);
}

module.exports = (releaseType, hasConfigFileChanged, additionalInfos = { pullRequestNumbers: [], teamLabels: [] }) => {
  return {
    response_action: 'push',
    view: modal(releaseType, hasConfigFileChanged, additionalInfos).buildToObject(),
  };
};

module.exports.sampleView = () => {
  return modal('minor', true);
};

module.exports.callbackId = callbackId;
