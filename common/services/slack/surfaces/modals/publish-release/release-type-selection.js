const { Modal, Blocks, Elements, Bits } = require('slack-block-builder');

const callbackId = 'release-type-selection';

function modal() {
  return Modal({
    title: 'Publier une release',
    callbackId,
    submit: 'Publier',
    close: 'Annuler'
  }).blocks([
    Blocks.Section({
      text: 'Pix utilise le format de gestion de versions _Semantic Versionning_ :\n- *patch* : contient exclusivement des correctif(s)\n- *minor* : contient au moins 1 évolution technique ou fonctionnelle\n- *major* : contient au moins 1 changement majeur d\'architecture'
    }),
    Blocks.Divider(),
    Blocks.Input({
      blockId: 'publish-release-type',
      label: 'Type de release',
    }).element(
      Elements.StaticSelect({
        actionId: 'release-type-option',
        placeholder: 'Selectionnez un élément',
      }).options([
        Bits.Option({
          text: 'Minor',
          value: 'minor'
        }),
        Bits.Option({
          text: 'Patch',
          value: 'patch'
        }),
        Bits.Option({
          text: 'Major',
          value: 'major'
        })
      ]).initialOption(Bits.Option({
        text: 'Minor',
        value: 'minor'
      }))
    )
  ]);
}

module.exports = (triggerId) => {
  return {
    trigger_id: triggerId,
    view: modal().buildToObject()
  };
};

module.exports.sampleView = () => {
  return modal();
};

module.exports.callbackId = callbackId;
