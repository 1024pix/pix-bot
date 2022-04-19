function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

function _getCommaSeparatedValues(valuesAsString) {
  if (!valuesAsString) {
    return undefined;
  }
  return valuesAsString.split(',').map(v => v.trim());
}

function _getJSON(value) {
  if (!value) {
    return undefined;
  }

  return JSON.parse(value);
}

module.exports = (function() {

  const config = {
    port: _getNumber(process.env.PORT, 3000),
    environment: (process.env.NODE_ENV || 'development'),

    pixApps: _getCommaSeparatedValues(process.env.PIX_APPS_TO_DEPLOY),

    baleen: {
      pat: process.env.BALEEN_PERSONAL_ACCESS_TOKEN,
      appNamespaces: _getJSON(process.env.BALEEN_APP_NAMESPACES),
    },

    scalingo: {
      reviewApps: {
        token: process.env.SCALINGO_TOKEN_REVIEW_APPS,
        apiUrl: process.env.SCALINGO_API_URL_REVIEW_APPS || 'https://api.osc-fr1.scalingo.com',
      },
      integration: {
        token: process.env.SCALINGO_TOKEN_INTEGRATION,
        apiUrl: process.env.SCALINGO_API_URL_INTEGRATION || 'https://api.osc-fr1.scalingo.com',
      },
      recette: {
        token: process.env.SCALINGO_TOKEN_RECETTE,
        apiUrl: process.env.SCALINGO_API_URL_RECETTE,
      },
      production: {
        token: process.env.SCALINGO_TOKEN_PRODUCTION,
        apiUrl: process.env.SCALINGO_API_URL_PRODUCTION,
      }
    },

    openApi: {
      authorizationToken: process.env.AUTHORIZATION_TOKEN,
    },

    slack: {
      requestSigningSecret: process.env.SLACK_SIGNING_SECRET,
      botToken: process.env.SLACK_BOT_TOKEN,
      webhookUrlForReporting: process.env.SLACK_WEBHOOK_URL_FOR_REPORTING,
    },

    github: {
      token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
      owner: process.env.GITHUB_OWNER,
      repository: process.env.GITHUB_REPOSITORY,
      webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    },

    googleSheet: {
      key: process.env.GOOGLE_SHEET_API_KEY,
      idA11Y: process.env.GOOGLE_SHEET_A11Y
    },

    sendInBlue: {
      apiKey: process.env.SEND_IN_BLUE_API_KEY,
      mailingQuota: process.env.SEND_IN_BLUE_QUOTA,
    },

    thirdServicesUsageReport: {
      schedule: process.env.THIRD_SERVICES_USAGE_REPORT_SCHEDULE,
    },

    prismic: {
      secret: process.env.PRISMIC_SECRET,
    },

    pixSiteDeploy: {
      schedule: process.env.PIX_SITE_DEPLOY_SCHEDULE,
    },

    PIX_REPO_NAME: 'pix',
    PIX_BOT_REPO_NAME: 'pix-bot',
    PIX_LCMS_REPO_NAME: 'pix-editor',
    PIX_LCMS_APP_NAME: 'pix-lcms',
    PIX_UI_REPO_NAME: 'pix-ui',
    PIX_EMBER_TESTING_LIBRARY_REPO_NAME: 'ember-testing-library',
    PIX_SITE_REPO_NAME: 'pix-site',
    PIX_SITE_APPS: ['pix-site', 'pix-pro'],
    PIX_DATAWAREHOUSE_REPO_NAME: 'pix-db-replication',
    PIX_DATAWAREHOUSE_APPS_NAME: ['pix-datawarehouse', 'pix-datawarehouse-ex'],
    PIX_APPS: ['app', 'certif', 'admin', 'orga', 'api'],
    PIX_APPS_ENVIRONMENTS: ['integration', 'recette', 'production'],
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.baleen.pat = 'baleen-pat';
    config.baleen.appNamespaces = _getJSON('{"Pix_Test":"Pix_Namespace","Pix_Test_2":"Pix Namespace 2"}');

    config.github.token = undefined;
    config.github.owner = 'github-owner';
    config.github.repository = 'github-repository';
    config.github.webhookSecret = 'github-webhook-secret';

    config.slack.requestSigningSecret = 'slack-super-signing-secret';

    config.openApi.authorizationToken = 'open-api-token';

    config.scalingo.recette.token = 'tk-us-scalingo-token-recette';
    config.scalingo.recette.apiUrl = 'https://scalingo.recette';
    config.scalingo.production.token = 'tk-us-scalingo-token-production';
    config.scalingo.production.apiUrl = 'https://scalingo.production';

    config.pixApps = ['pix-app1', 'pix-app2', 'pix-app3'];

    config.prismic.secret = 'prismic-secret';
  }

  return config;

})();
