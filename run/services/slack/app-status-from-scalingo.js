const ScalingoClient = require('../../../common/services/scalingo-client');

async function getAppStatusFromScalingo(appName) {
  if (!appName) {
    return { text: 'Un nom d\'application est attendu en paramètre (ex: pix-app-production)' } ;
  }

  const environment = appName.endsWith('production') ? 'production' : 'recette';

  try {
    const client = await ScalingoClient.getInstance(environment);
    const { name, url, isUp, lastDeployementAt, lastDeployedBy, lastDeployedVersion } = await client.getAppInfo(
      appName
    );

    const appStatus = isUp ? `*${name}* is up 💚` : `*${name}* is down 🛑`;

    return {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: appStatus,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Version *${lastDeployedVersion}*`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Deployée par *${lastDeployedBy}* à ${lastDeployementAt}.`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Application',
              },
              url: url,
            },
          ],
        },
      ],
    };
  } catch (error) {
    return { text: `Une erreur est survenue : "${error.message}"` } ;
  }
}

module.exports = { getAppStatusFromScalingo };
