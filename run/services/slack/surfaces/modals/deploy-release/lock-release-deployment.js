import { Blocks, Elements, Modal } from 'slack-block-builder';

const callbackId = 'lock-release-deployment';

function modal() {
  return Modal({
    title: 'BLOQUER LA MISE EN PRODUCTION 🚨',
    callbackId,
    submit: 'Bloquer ✋',
    close: 'Annuler',
  }).blocks([
    Blocks.Input({
      blockId: 'lock-reason',
      label: 'Pourquoi la mise en production doit être interrompue ?',
    }).element(
      Elements.TextInput({
        actionId: 'lock-reason-value',
        placeholder: 'Un bug a été découvert sur la recette',
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
