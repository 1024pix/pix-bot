import { name, version, description } from '../../package.json';
import { sampleView as releaseTypeSelection } from '../../build/services/slack/surfaces/modals/publish-release/release-type-selection.js';
import { sampleView as releaseTagSelection } from '../../run/services/slack/surfaces/modals/deploy-release/release-tag-selection.js';
import { sampleView as createAppOnScalingoSelection } from '../../run/services/slack/surfaces/modals/scalingo-apps/application-creation.js';
import { sampleView as releaseDeploymentConfirmation } from '../../run/services/slack/surfaces/modals/deploy-release/release-deployment-confirmation.js';
import { sampleView as releasePublicationConfirmation } from '../../build/services/slack/surfaces/modals/publish-release/release-publication-confirmation.js';
import { sampleView as submitApplicationNameSelection } from '../../run/services/slack/surfaces/modals/scalingo-apps/application-creation-confirmation.js';

const controllers = {
  getApiInfo() {
    return {
      name,
      version,
      description,
    };
  },

  getSlackViews() {
    const views = [
      { name: 'release-type-selection', view: releaseTypeSelection() },
      { name: 'release-tag-selection', view: releaseTagSelection() },
      { name: 'create-app-on-scalingo', view: createAppOnScalingoSelection() },
      { name: 'release-deployment-confirmation', view: releaseDeploymentConfirmation() },
      { name: 'release-publication-confirmation', view: releasePublicationConfirmation() },
      { name: 'application-creation-confirmation', view: submitApplicationNameSelection() },
    ];
    return views
      .map(({ name, view }) => {
        return `<a href="${view.getPreviewUrl()}">View ${name}</a>`;
      })
      .join('<br>');
  },
};

export default controllers;
