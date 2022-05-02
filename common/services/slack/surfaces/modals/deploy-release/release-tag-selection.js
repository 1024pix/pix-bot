const { Modal, Blocks, Elements } = require('slack-block-builder');

const callbackId = 'release-tag-selection';

module.exports = (triggerId) => {
  const modal = Modal({
    title: 'Déployer une release',
    callbackId,
    submit: 'Déployer',
    close: 'Annuler'
  }).blocks([
    Blocks.Input({
      blockId: 'deploy-release-tag',
      label: 'Numéro de release',
    }).element(Elements.TextInput({
      actionId: 'release-tag-value',
      placeholder: 'Ex : v2.130.0'
    }))
  ]);

  return {
    trigger_id: triggerId,
    view: modal.buildToObject()
  };
};

module.exports.callbackId = callbackId;
