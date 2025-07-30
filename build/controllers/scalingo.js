import dayjs from 'dayjs';
import { Attachment, Context, Message, Section } from 'slack-block-builder';

import { logger } from '../../common/services/logger.js';
import slackPostMessageService from '../../common/services/slack/surfaces/messages/post-message.js';
import { config } from '../../config.js';
import * as reviewAppRepository from '../repositories/review-app-repository.js';
import { ScalingoAppName } from '../../common/models/ScalingoAppName.js';
import { updateCheckRADeployment } from '../usecases/updateCheckRADeployment.js';

function getSlackMessageAttachments(payload) {
  const appName = payload.app_name;
  const scalingoAppUrl = `${config.scalingo.oscFr1Url}/${appName}/`;
  const appActivityUrl = `${scalingoAppUrl}activity`;
  const appDeploymentUrl = `${scalingoAppUrl}deploy/${payload.type_data.deployment_uuid}`;
  const deploymentStatus = payload.type_data.status;
  const pusher = payload.type_data.pusher;
  const gitRef = payload.type_data.git_ref;
  const userName = payload.user?.username;
  const eventDate = dayjs(payload.type_data.finished_at).format('MMM D');
  const message = `[${appName}] App deployment error`;

  return {
    message,
    attachments: Message()
      .attachments(
        Attachment({ color: '#A95800' })
          .blocks(
            Section({
              text: `*<${appActivityUrl}|[${appName}] App deployed>*`,
            }),
            Section().fields(
              `*Deployment failed*\nWith status '${deploymentStatus}'`,
              `*Deployment logs*\n<${appDeploymentUrl}|${appName}>`,
            ),
            Section().fields(`*Pusher*\n${pusher}`, `*Git SHA*\n${gitRef}`),
            Context().elements(`By ${userName} | ${eventDate}`),
          )
          .fallback(message),
      )
      .buildToObject().attachments,
  };
}

const scalingo = {
  async deployEndpoint(request) {
    logger.info({
      event: 'scalingo',
      message: 'Scalingo request received',
    });

    if (request.payload.type_data?.status !== 'build-error') {
      return 'Slack error notification not sent';
    }

    logger.warn({
      event: 'scalingo',
      message: `Failed deployment on the ${request.payload.app_name} app`,
    });

    const { message, attachments } = getSlackMessageAttachments(request.payload);

    await slackPostMessageService.postMessage({ message, attachments: JSON.stringify(attachments) });

    logger.warn({
      event: 'scalingo',
      message: 'Slack error notification sent',
    });

    return 'Slack error notification sent';
  },

  async reviewAppDeployEndpoint(request, h) {
    const event = 'review-app-deploy';
    const appName = request.payload.app_name;
    const type = request.payload.type;
    const { status, deployment_type: deploymentType, git_ref: sha } = request.payload.type_data;

    logger.info({
      event,
      message: `Scalingo deployment request received for application ${appName}.`,
    });

    if (type !== 'deployment' || deploymentType !== 'deployment') {
      logger.error({ event, message: `The event type is not deployment.` });
      return h.response().code(200);
    }

    if (status !== 'success' && !status.includes('error')) {
      logger.warn({ event, message: `The status "${status}" is not managed by this hook.` });
      return h.response().code(200);
    }

    if (!ScalingoAppName.isReviewApp(appName)) {
      logger.error({ event, message: `The application ${appName} is not linked to a pull request.` });
      return h.response().code(200);
    }

    const reviewApp = await reviewAppRepository.get(appName);
    if (!reviewApp) {
      logger.warn({ event, message: `Application ${appName} was not found` });
      return h.response().code(200);
    }
    const { repository, prNumber } = reviewApp;

    if (reviewApp.autoDeployEnabled) {
      try {
        const client = await dependencies.scalingoClient.getInstance('reviewApps');
        client.disableAutoDeploy(appName);
        await reviewAppRepository.setAutodeployEnabled({ name: appName, autodeployEnabled: false });
      } catch (error) {
        logger.error({
          event,
          stack: error.stack,
          message: 'Disabling autodeploy for Review App failed',
          data: { appName },
        });
      }
    }

    if (status.includes('error')) {
      await reviewAppRepository.setStatus({ name: appName, status: 'failure' });
      logger.info({ event, message: `Application ${appName} marked as failed.` });

      logger.info({
        event,
        message: `Changing check-ra-deployment status to failure`,
        data: { repository, prNumber },
      });
      await updateCheckRADeployment({ repositoryName: repository, pullRequestNumber: prNumber, sha });
      return h.response().code(200);
    }

    await reviewAppRepository.setStatus({ name: appName, status: 'success' });
    logger.info({ event, message: `Application ${appName} marked as deployed.` });

    await updateCheckRADeployment({ repositoryName: repository, pullRequestNumber: prNumber, sha });

    return h.response().code(200);
  },
};

export default scalingo;
