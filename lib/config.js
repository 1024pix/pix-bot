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

module.exports = (function() {

  const config = {
    port: _getNumber(process.env.PORT, 3000),
    environment: (process.env.NODE_ENV || 'development'),

    pixApps: _getCommaSeparatedValues(process.env.PIX_APPS_TO_DEPLOY),

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

  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.github.token = 'github-personal-access-token';
    config.github.owner = 'github-owner';
    config.github.repository = 'github-repository';

    config.scalingo.recette.token = 'tk-us-scalingo-token-recette';
    config.scalingo.recette.apiUrl = 'https://scalingo.recette';
    config.scalingo.production.token = 'tk-us-scalingo-token-production';
    config.scalingo.production.apiUrl = 'https://scalingo.production';

    config.pixApps = ['pix-app1', 'pix-app2', 'pix-app3'];
  }

  return config;

})();
