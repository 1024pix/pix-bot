import { Modal, Blocks, Elements } from 'slack-block-builder';

const callbackId = 'release-tag-selection';

function modal() {
  return Modal({
    title: 'Déployer une release',
    callbackId,
    submit: 'Déployer',
    close: 'Annuler',
  }).blocks([
    Blocks.Input({
      blockId: 'deploy-release-tag',
      label: 'Numéro de release',
    }).element(
      Elements.TextInput({
        actionId: 'release-tag-value',
        placeholder: 'Ex : v2.130.0',
      }),
    ),
  ]);
}

const releaseTagSelection = (triggerId) => {
  return {
    trigger_id: triggerId,
    view: modal().buildToObject(),
  };
};

const sampleView = () => {
  return modal();
};

export { releaseTagSelection, sampleView, callbackId };
