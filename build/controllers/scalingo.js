const dayjs = require('dayjs');
const slackPostMessageService = require('../../common/services/slack/surfaces/messages/post-message');
const { Message, Section, Context, Attachment } = require('slack-block-builder');
const config = require('../../config');
const logger = require('../../common/services/logger');

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

module.exports = {
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
};
