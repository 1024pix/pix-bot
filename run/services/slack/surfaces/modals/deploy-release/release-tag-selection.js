import { Blocks, Elements, Modal } from 'slack-block-builder';
import { getByRepositoryName } from '../../../../../../common/repositories/release-settings.repository.js';

const callbackId = 'release-tag-selection';

function modal(isSubmitable) {
  const headers = {
    title: 'Déployer une release',
    callbackId,
    submit: isSubmitable ? 'Déployer' : null,
    close: isSubmitable ? 'Annuler' : 'Fermer',
  };
  let block;
  if (isSubmitable) {
    block = [
      Blocks.Input({
        blockId: 'deploy-release-tag',
        label: 'Numéro de release',
      }).element(
        Elements.TextInput({
          actionId: 'release-tag-value',
          placeholder: 'Ex : v2.130.0',
        }),
      ),
    ];
  } else {
    block = [
      Blocks.Section({
        text: 'La mep est actuellement bloquée. Vérifiez pourquoi, débloquez-la puis relancez la commande.',
      }),
    ];
  }
  return Modal(headers).blocks(block);
}

const getView = async (triggerId) => {
  const autorization = await getByRepositoryName('pix');
  return {
    trigger_id: triggerId,
    view: modal(autorization.autorizeProd).buildToObject(),
  };
};

const sampleView = () => {
  return modal();
};

export default { callbackId, getView, sampleView };
