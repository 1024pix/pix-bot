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

    const text = appInfos.map((appInfo) => {
      const appStatus = appInfo.isUp ? `*${appInfo.name}* is up 💚` : `*${appInfo.name}* is down 🛑`;
      return `· ${appStatus} - ${appInfo.lastDeployedVersion} deployed at ${appInfo.lastDeployementAt}`;
    });

    return {
      response_type: 'in_channel',
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': text.join('\n'),
          }
        }
      ]
    };
  } catch (error) {
    return { text: `Une erreur est survenue : "${error.message}"` } ;
  }
}

module.exports = { getAppStatusFromScalingo };
