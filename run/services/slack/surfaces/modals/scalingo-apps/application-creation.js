const { Modal, Blocks, Elements, Bits } = require('slack-block-builder');
const regions = [
  { id: 'production', name: 'Paris - SecNumCloud - Outscale' },
  { id: 'recette', name: 'Paris - Outscale' },
];
const callbackId = 'application-name-selection';

function modal() {
  return Modal({
    title: 'Créer une application',
    callbackId,
    submit: 'Créer',
    close: 'Annuler',
  }).blocks([
    Blocks.Input({
      blockId: 'create-app-name',
      label: "Nom de l'application",
    }).element(
      Elements.TextInput({
        actionId: 'scalingo-app-name',
        placeholder: 'application-name',
        initialValue: 'pix-super-application-recette',
      })
    ),
    Blocks.Input({ blockId: 'application-env', label: 'Quelle région ?' }).element(
      Elements.StaticSelect({ placeholder: 'Choisis la région' })
        .actionId('item')
        .options(regions.map((item) => Bits.Option({ text: item.name, value: item.id })))
    ),
  ]);
}

module.exports = (triggerId) => {
  return {
    trigger_id: triggerId,
    view: modal(regions).buildToObject(),
  };
};

module.exports.sampleView = () => {
  return modal(regions);
};

module.exports.callbackId = callbackId;
