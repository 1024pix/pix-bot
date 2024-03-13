import { Modal, Blocks } from 'slack-block-builder';

const callbackId = 'application-creation-confirmation';

function modal(applicationName, applicationEnvironment, applicationEnvironmentName, userEmail) {
  return Modal({
    title: 'Confirmation',
    callbackId,
    privateMetaData: JSON.stringify({
      applicationName: applicationName,
      applicationEnvironment: applicationEnvironment,
      userEmail: userEmail,
    }),
    submit: '🚀 Go !',
    close: 'Annuler',
  }).blocks([
    Blocks.Section({
      text: `Vous vous apprêtez à créer l'application *${applicationName}* dans la région : *${applicationEnvironmentName}* et à inviter cet adresse email en tant que collaborateur : *${userEmail}*`,
    }),
  ]);
}

const applicationCreationConfirmation = (
  applicationName,
  applicationEnvironment,
  applicationEnvironmentName,
  userEmail,
) => {
  return {
    response_action: 'push',
    view: modal(applicationName, applicationEnvironment, applicationEnvironmentName, userEmail).buildToObject(),
  };
};

const sampleView = () => {
  return modal('pix-application-name-recette', 'recette', 'Paris - SecNumCloud - Outscale', 'john.doe@pix.fr');
};

export { applicationCreationConfirmation, sampleView, callbackId };
