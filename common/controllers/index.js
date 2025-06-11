import pkg from '../../package.json' with { type: 'json' };
const { description, name, version } = pkg;

import releasePublicationConfirmationModal from '../../build/services/slack/surfaces/modals/publish-release/release-publication-confirmation.js';
import releaseTypeSelectionModal from '../../build/services/slack/surfaces/modals/publish-release/release-type-selection.js';
import releaseDeploymentConfirmationModal from '../../run/services/slack/surfaces/modals/deploy-release/release-deployment-confirmation.js';
import releaseTagSelectionModal from '../../run/services/slack/surfaces/modals/deploy-release/release-tag-selection.js';
import lockReleaseDeployment from '../../run/services/slack/surfaces/modals/deploy-release/lock-release-deployment.js';
import createAppOnScalingoSelectionModal from '../../run/services/slack/surfaces/modals/scalingo-apps/application-creation.js';
import submitApplicationNameSelectionModal from '../../run/services/slack/surfaces/modals/scalingo-apps/application-creation-confirmation.js';
import * as applicationsDeploymentService from '../services/applications-deployment.service.js';
import { config } from '../../config.js';

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
      { name: 'release-type-selection', view: releaseTypeSelectionModal.sampleView() },
      { name: 'release-tag-selection', view: releaseTagSelectionModal.sampleView() },
      { name: 'create-app-on-scalingo', view: createAppOnScalingoSelectionModal.sampleView() },
      { name: 'release-deployment-confirmation', view: releaseDeploymentConfirmationModal.sampleView() },
      { name: 'release-publication-confirmation', view: releasePublicationConfirmationModal.sampleView() },
      { name: 'application-creation-confirmation', view: submitApplicationNameSelectionModal.sampleView() },
      { name: 'lock-release-view', view: lockReleaseDeployment.sampleView() },
    ];
    return views
      .map(({ name, view }) => {
        return `<a href="${view.getPreviewUrl()}">View ${name}</a>`;
      })
      .join('<br>');
  },

  async applicationIsDeployed(request, h) {
    if (request.query.token !== config.authorizationToken) {
      return h.response().code(401);
    }
    const environment = request.query.environment;
    const app = request.payload.app_name;
    const version = request.payload.type_data.git_ref;
    if (!applicationsDeploymentService.isPixApplication(app)) {
      return h.response().code(422);
    } else if (request.payload.type_data.status !== 'success') {
      return h.response().code(200);
    }
    await applicationsDeploymentService.addNewVersion({ environment, version });
    await applicationsDeploymentService.markAppHasDeployed({ version, environment, app });
    return h.response().code(200);
  },
};

export default controllers;
