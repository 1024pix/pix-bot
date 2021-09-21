module.exports = (releaseTag, hasConfigFileChanged) => {
  const modalReleaseDeploymentConfirmation = {
    'response_action': 'push',
    'view': {
      'type': 'modal',
      'callback_id': 'release-deployment-confirmation',
      'private_metadata': `${releaseTag}`,
      'title': {
        'type': 'plain_text',
        'text': 'Confirmation'
      },
      'submit': {
        'type': 'plain_text',
        'text': '🚀 Go !',
        'emoji': true
      },
      'close': {
        'type': 'plain_text',
        'text': 'Annuler',
        'emoji': true
      },
      'blocks': [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `Vous vous apprêtez à déployer la version *${releaseTag}* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?`
          }
        },
      ]
    }
  };

  if(hasConfigFileChanged) {
    modalReleaseDeploymentConfirmation.view.blocks.unshift({
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': ':warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d\'environnement sont bien à jour sur *Scalingo PRODUCTION*.'
      },
    });
  }

  return modalReleaseDeploymentConfirmation;
};
