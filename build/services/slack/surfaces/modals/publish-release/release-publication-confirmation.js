module.exports = (releaseType) => {
  return {
    'response_action': 'push',
    'view': {
      'type': 'modal',
      'callback_id': 'release-publication-confirmation',
      'private_metadata': `${releaseType}`,
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
            'text': `Vous vous apprêtez à publier une version *${releaseType}* et la déployer en recette. Êtes-vous sûr de vous ?`
          }
        },
      ]
    }
  };
};