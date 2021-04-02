const ScalingoClient = require('../../../common/services/scalingo-client');

async function getAppStatusFromScalingo(appName) {
  if (!appName) {
    return { text: 'Un nom d\'application est attendu en paramètre (ex: pix-app-production)' } ;
  }

  const environment = appName.endsWith('recette') ? 'recette' : 'production';

  try {
    const client = await ScalingoClient.getInstance(environment);
    const appInfos = await client.getAppInfo(
      appName
    );

    const blocks = appInfos.map((appInfo) => {
      const appStatus = appInfo.isUp ? '💚' : '🛑';
      return {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*${appInfo.name}* ${appStatus} - ${appInfo.lastDeployedVersion}\n${appInfo.lastDeployementAt}`,
        }
      };
    });

    return {
      response_type: 'in_channel',
      blocks,
    };
  } catch (error) {
    return { text: `Une erreur est survenue : "${error.message}"` } ;
  }
}

module.exports = { getAppStatusFromScalingo };
