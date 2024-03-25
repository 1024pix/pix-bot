import ScalingoClient from '../../../common/services/scalingo-client.js';

async function getAppStatusFromScalingo(appName) {
  if (!appName) {
    return { text: "Un nom d'application est attendu en paramètre (ex: pix-app-production)" };
  }

  const environment = _getEnvironmentFrom({ appName });

  try {
    const client = await ScalingoClient.getInstance(environment);
    const appInfos = await client.getAppInfo(appName);

    const blocks = appInfos.map((appInfo) => {
      const appStatus = appInfo.isUp ? '💚' : '🛑';
      const lastVersionDisplayed = environment === 'integration' ? '' : ` - ${appInfo.lastDeployedVersion}`;
      return {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${appInfo.name}* ${appStatus}${lastVersionDisplayed}\n${appInfo.lastDeployementAt}`,
        },
      };
    });

    return {
      response_type: 'in_channel',
      blocks,
    };
  } catch (error) {
    return { text: `Une erreur est survenue : "${error.message}"` };
  }
}

function _getEnvironmentFrom({ appName }) {
  if (appName.endsWith('integration')) {
    return 'integration';
  } else if (appName.endsWith('recette')) {
    return 'recette';
  }
  return 'production';
}

export { getAppStatusFromScalingo };
