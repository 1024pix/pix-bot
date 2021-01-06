module.exports = (triggerId) => {
  return {
    'trigger_id': `${triggerId}`,
    'view': {
      'type': 'modal',
      'callback_id': 'release-type-selection',
      'title': {
        'type': 'plain_text',
        'text': 'Publier une release',
        'emoji': true
      },
      'submit': {
        'type': 'plain_text',
        'text': 'Publier',
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
            'text': 'Pix utilise le format de gestion de versions _Semantic Versionning_ :\n- *patch* : contient exclusivement des correctif(s)\n- *minor* : contient au moins 1 évolution technique ou fonctionnelle\n- *major* : contient au moins 1 changement majeur d\'architecture'
          }
        },
        {
          'type': 'divider'
        },
        {
          'type': 'input',
          'block_id': 'publish-release-type',
          'label': {
            'type': 'plain_text',
            'text': 'Type de release',
            'emoji': true
          },
          'element': {
            'action_id': 'release-type-option',
            'type': 'static_select',
            'placeholder': {
              'type': 'plain_text',
              'text': 'Selectionnez un élément'
            },
            'initial_option': {
              'text': {
                'type': 'plain_text',
                'text': 'Minor'
              },
              'value': 'minor'
            },
            'options': [
              {
                'text': {
                  'type': 'plain_text',
                  'text': 'Minor'
                },
                'value': 'minor'
              },
              {
                'text': {
                  'type': 'plain_text',
                  'text': 'Patch'
                },
                'value': 'patch'
              },
              {
                'text': {
                  'type': 'plain_text',
                  'text': 'Major'
                },
                'value': 'major'
              }
            ]
          }
        }
      ]
    }
  };
};
