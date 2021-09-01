const releasesService = require('../../../common/services/releases');
const ScalingoClient = require('../../../common/services/scalingo-client');
const githubServices = require('../../../common/services/github');
const axios = require('axios');
const postSlackMessage = require('../../../common/services/slack/surfaces/messages/post-message');
const updateSlackMessage = require('../../../common/services/slack/surfaces/messages/update-message');

const PIX_REPO_NAME = 'pix';
const PIX_BOT_REPO_NAME = 'pix-bot';
const PIX_LCMS_REPO_NAME = 'pix-editor';
const PIX_LCMS_APP_NAME = 'pix-lcms';
const PIX_UI_REPO_NAME = 'pix-ui';
const PIX_SITE_REPO_NAME = 'pix-site';
const PIX_SITE_APPS = ['pix-site', 'pix-pro'];
const PIX_DATAWAREHOUSE_REPO_NAME = 'pix-db-replication';
const PIX_DATAWAREHOUSE_APPS_NAME = ['pix-datawarehouse', 'pix-datawarehouse-ex'];
const PIX_APPS = ['app', 'certif', 'admin', 'orga', 'api'];
const PIX_APPS_ENVIRONMENTS = ['integration', 'recette', 'production'];

const PIX_TEST_REPO_NAME = 'pix-bot-release-test';
const PIX_TEST_APPS_NAME = ['pix-test'];

function sendResponse(responseUrl, text) {
  let body = { text };
  if (typeof text === 'object') {
    body = text;
  }
  return axios.post(responseUrl,
    body,
    {
      headers: {
        'content-type': 'application/json',
      },
    },
  );
}

function getErrorReleaseMessage(release, appName) {
  return `Erreur lors du déploiement de la release '${release}' pour ${appName} en production.`;
}

function getSuccessMessage(release, appName) {
  return `Le script de déploiement de la release '${release}' pour ${appName} en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…`;
}

function getErrorAppMessage(appName) {
  return `Erreur lors du déploiement de ${appName} en production.`;
}

function _isReleaseTypeInvalid(releaseType) {
  return !['major', 'minor', 'patch'].includes(releaseType);
}
async function publishAndDeployPixUI(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  const releaseTagBeforeRelease = await githubServices.getLatestReleaseTag(repoName);
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTagAfterRelease = await githubServices.getLatestReleaseTag(repoName);

  if (releaseTagBeforeRelease === releaseTagAfterRelease) {
    sendResponse(responseUrl, getErrorReleaseMessage(releaseTagAfterRelease, repoName));
  } else {
    sendResponse(responseUrl, getSuccessMessage(releaseTagAfterRelease, repoName));
    postSlackMessage({ text: `[PIX-UI] App deployed (${releaseTagAfterRelease})` });
  }
}

function _waitForDeploymentFinished(appName, deployment, environment, status) {
  return new Promise(async (resolve, reject) => {
    try {
      async function pollDeploymentStatus() {
        const deploymentStatusResponse = await releasesService.getDeploymentStatus(appName, deployment.id, environment);
        if (!['queued', 'building', 'pushing', 'starting'].includes(deploymentStatusResponse.status)) {
          resolve(deploymentStatusResponse);
        } else {
          status(deploymentStatusResponse);
          setTimeout(() => {
            pollDeploymentStatus();
          }, 1000)
        }
      }
      pollDeploymentStatus();
    } catch (e) {
      reject(e);
    }
  });
}

async function _waitForAllDeploymentsFinished(releaseTag, releaseType, appNames, deployments, environment, channel, ts) {
  const newDeployments = [...deployments];
  const promises = appNames.map(async (appName, index) => {
    const deploymentFinished = await _waitForDeploymentFinished(appName, deployments[index], environment, (deploymentStatus) => {
      newDeployments[index] = deploymentStatus;
      updateSlackMessage(channel, ts, formatMessage(appNames, releaseType, { published: true, releaseTag, deployments: newDeployments }));
    });
    newDeployments[index] = deploymentFinished;
    updateSlackMessage(channel, ts, formatMessage(appNames, releaseType, { published: true, releaseTag, deployments: newDeployments }));
  });
  return Promise.all(promises);
}

function formatMessage(appNames, releaseType, { releaseTag, published, deployments } = { releaseTag: '', published: false, deployments: []}) {
  const versionMessage = releaseTag ? `${releaseTag} (${releaseType})` : releaseType;
  const scalingoStatus2emoji = {
    queued: ':hourglass:',
    building: ':hammer:',
    pushing: ':incoming_envelope:',
    starting: ':car:',
    success: ':white_check_mark:',
    aborted: ':x: (aborted)',
    'build-error': ':x: build-error',
    'crashed-error': ':x: crashed-error',
    'timeout-error': ':x: timeout-error',
    'hook-error': ':x:x hook-error'
  };
  return {
    blocks: [
      {
	type: 'header',
	text: {
	  type: 'plain_text',
	  text: `Publication de ${versionMessage} et mise en production de ${appNames.join(', ')}`
	}
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${published ? ':white_check_mark:' : ':hourglass:'} Publication de la nouvelle version`
        }
      },
      ...appNames.map((appName, index) => {
        return {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${deployments && deployments[index] ? scalingoStatus2emoji[deployments[index].status] : ':hourglass:'} Déploiement de ${appName}`
          }
        }
      })
    ]
  };
}

async function publishAndDeployRelease(repoName, appNamesList = [], releaseType, responseUrl) {
  try {
    if (_isReleaseTypeInvalid(releaseType)) {
      releaseType = 'minor';
    }
    const { channel, ts } = (await postSlackMessage(formatMessage(appNamesList, releaseType))).data;

    await releasesService.publishPixRepo(repoName, releaseType);
    const response2 = await updateSlackMessage(channel, ts, formatMessage(appNamesList, releaseType, { published: true }));

    const releaseTag = await githubServices.getLatestReleaseTag(repoName);
    const environment = 'production';

    await updateSlackMessage(channel, ts, formatMessage(appNamesList, releaseType, { published: true, releaseTag }));

    const deploymentsPromise = appNamesList.map((appName) => releasesService.deployPixRepo(repoName, appName, releaseTag, environment));

    const deployments = await Promise.all(deploymentsPromise);

    await updateSlackMessage(channel, ts, formatMessage(appNamesList, releaseType, { published: true, releaseTag, deployments }));

    await _waitForAllDeploymentsFinished(releaseTag, releaseType, appNamesList, deployments, environment, channel, ts);
  } catch (e) {
    console.log(e);
    sendResponse(responseUrl, {
      blocks: [
	{
	  type: 'header',
	  text: {
	    type: 'plain_text',
	    text: `Publication ${releaseType} et mise en production de ${appNamesList.join(', ')}`
	  }
	},
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':x: Erreur'
          }
        }
      ]
    });
  }
}

async function publishAndDeployPixBot(repoName, releaseType, responseUrl) {
  if (_isReleaseTypeInvalid(releaseType)) {
    releaseType = 'minor';
  }
  await releasesService.publishPixRepo(repoName, releaseType);
  const releaseTag = await githubServices.getLatestReleaseTag(repoName);

  const recette = await ScalingoClient.getInstance('recette');
  await recette.deployFromArchive('pix-bot-build', releaseTag, repoName, { withEnvSuffix: false });

  const production = await ScalingoClient.getInstance('production');
  await production.deployFromArchive('pix-bot-run', releaseTag, repoName);

  sendResponse(responseUrl, `Pix Bot deployed (${releaseTag})`);
}

async function getAndDeployLastVersion({ appName }) {
  const lastReleaseTag = await githubServices.getLatestReleaseTag(PIX_REPO_NAME);
  const sanitizedAppName = appName.trim().toLowerCase();

  const appNameParts = sanitizedAppName.split('-');
  const environment = appNameParts[appNameParts.length - 1];

  if (!_isAppFromPixRepo({ appName: sanitizedAppName })) {
    throw Error('L‘application doit faire partie du repo Pix');
  }

  const shortAppName = appNameParts[0] + '-' + appNameParts[1];
  await releasesService.deployPixRepo(PIX_REPO_NAME, shortAppName, lastReleaseTag, environment);
}

function _isAppFromPixRepo({ appName }) {
  const appNameParts = appName.split('-');

  if(appNameParts.length != 3) {
    return false;
  }

  const [appNamePrefix, shortAppName, environment] = appName.split('-');

  return appNamePrefix === 'pix'
    && PIX_APPS.includes(shortAppName)
    && PIX_APPS_ENVIRONMENTS.includes(environment);
}

module.exports = {

  async createAndDeployPixLCMS(payload) {
    await publishAndDeployRelease(PIX_LCMS_REPO_NAME, [PIX_LCMS_APP_NAME], payload.text, payload.response_url);
  },

  async createAndDeployPixUI(payload) {
    await publishAndDeployPixUI(PIX_UI_REPO_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixSiteRelease(payload) {
    await publishAndDeployRelease(PIX_SITE_REPO_NAME, PIX_SITE_APPS, payload.text, payload.response_url);
  },

  async createAndDeployPixDatawarehouse(payload) {
    await publishAndDeployRelease(PIX_DATAWAREHOUSE_REPO_NAME, PIX_DATAWAREHOUSE_APPS_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixBotRelease(payload) {
    await publishAndDeployPixBot(PIX_BOT_REPO_NAME, payload.text, payload.response_url);
  },

  async createAndDeployPixTest(payload) {
    await publishAndDeployRelease(PIX_TEST_REPO_NAME, PIX_TEST_APPS_NAME, payload.text, payload.response_url);
  },

  async getAndDeployLastVersion({ appName }) {
    await getAndDeployLastVersion({ appName });
  }

};
