import { Blocks, Elements, Modal } from 'slack-block-builder';

const callbackId = 'lock-release-deployment';

function modal() {
  return Modal({
    title: 'Bloquer la mep ✋',
    callbackId,
    submit: '💥Bloquer',
    close: 'Annuler',
  }).blocks([
    Blocks.Input({
      blockId: 'lock-reason',
      label: 'Motif du bloquage',
    }).element(
      Elements.TextInput({
        actionId: 'lock-reason-value',
        placeholder: 'Un bug a été détecté',
      }),
    ),
  ]);
}

const getView = (triggerId) => {
  return {
    trigger_id: triggerId,
    view: modal().buildToObject(),
  };
};

const sampleView = () => {
  return modal();
};

export default { callbackId, getView, sampleView };
