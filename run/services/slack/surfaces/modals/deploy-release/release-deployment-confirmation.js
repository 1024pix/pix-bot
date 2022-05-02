const callbackId = 'release-deployment-confirmation';

module.exports = (releaseTag, hasConfigFileChanged) => {
  const modalReleaseDeploymentConfirmation = {
    'response_action': 'push',
    'view': {
      'type': 'modal',
      'callback_id': callbackId,
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

  return modalReleaseDeploymentConfirmation;
};

module.exports.callbackId = callbackId;
