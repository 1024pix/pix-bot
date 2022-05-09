const { name, version, description } = require('../../package.json');
const { sampleView: releaseTypeSelection } = require('../services/slack/surfaces/modals/publish-release/release-type-selection');
const { sampleView: releaseTagSelection } = require('../services/slack/surfaces/modals/deploy-release/release-tag-selection');
const { sampleView: releaseDeploymentConfirmation } = require('../../run/services/slack/surfaces/modals/deploy-release/release-deployment-confirmation');
const { sampleView: releasePublicationConfirmation } = require('../../build/services/slack/surfaces/modals/publish-release/release-publication-confirmation');

module.exports = {

  getApiInfo() {
    return {
      name, version, description
    };
  },

  getSlackViews() {
    const views = [
      { name: 'release-type-selection', view: releaseTypeSelection() },
      { name: 'release-tag-selection', view: releaseTagSelection() },
      { name: 'release-deployment-confirmation', view: releaseDeploymentConfirmation() },
      { name: 'release-publication-confirmation', view: releasePublicationConfirmation() },
    ];
    return views.map(({ name, view }) => {
      return `<a href="${view.getPreviewUrl()}">View ${name}</a>`;
    }).join('<br>');
  }

};
