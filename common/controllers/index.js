const { name, version, description } = require('../../package.json');
const {
  sampleView: releaseTypeSelection,
} = require('../../build/services/slack/surfaces/modals/publish-release/release-type-selection');
const {
  sampleView: releaseTagSelection,
} = require('../../run/services/slack/surfaces/modals/deploy-release/release-tag-selection');
const {
  sampleView: createAppOnScalingoSelection,
} = require('../../run/services/slack/surfaces/modals/scalingo-apps/application-creation');
const {
  sampleView: releaseDeploymentConfirmation,
} = require('../../run/services/slack/surfaces/modals/deploy-release/release-deployment-confirmation');
const {
  sampleView: releasePublicationConfirmation,
} = require('../../build/services/slack/surfaces/modals/publish-release/release-publication-confirmation');
const {
  sampleView: submitApplicationNameSelection,
} = require('../../run/services/slack/surfaces/modals/scalingo-apps/application-creation-confirmation');

module.exports = {
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
