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
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.baleen.pat = 'baleen-pat';
    config.baleen.appNamespaces = _getJSON('{"Pix_Test":"Pix_Namespace","Pix_Test_2":"Pix Namespace 2"}');

    config.github.token = 'github-personal-access-token';
    config.github.owner = 'github-owner';
    config.github.repository = 'github-repository';

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
