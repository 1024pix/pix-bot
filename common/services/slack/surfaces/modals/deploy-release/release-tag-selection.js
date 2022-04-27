module.exports = (triggerId) => {
  return {
    'trigger_id': triggerId,
    'view': {
      'type': 'modal',
      'callback_id': 'release-tag-selection',
      'title': {
        'type': 'plain_text',
        'text': 'Déployer une release',
        'emoji': true
      },
      'submit': {
        'type': 'plain_text',
        'text': 'Déployer',
        'emoji': true
      },
      'close': {
        'type': 'plain_text',
        'text': 'Annuler',
        'emoji': true
      },
      'blocks': [
        {
          'type': 'input',
          'block_id': 'deploy-release-tag',
          'label': {
            'type': 'plain_text',
            'text': 'Numéro de release',
            'emoji': true
          },
          'element': {
            'type': 'plain_text_input',
            'action_id': 'release-tag-value',
            'placeholder': {
              'type': 'plain_text',
              'text': 'Ex : v2.130.0',
              'emoji': true
            }
          }
        },
      ]
    }
  };
};
