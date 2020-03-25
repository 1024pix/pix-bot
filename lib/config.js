function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

module.exports = (function() {

  const config = {
    port: _getNumber(process.env.PORT, 3000),
    environment: (process.env.NODE_ENV || 'development'),

    reviewApps: {
      scalingoApiUrl: process.env.SCALINGO_API_URL || 'https://api.osc-fr1.scalingo.com',
      scalingoToken: process.env.SCALINGO_TOKEN,
    },

    openApi: {
      authorizationToken: process.env.AUTHORIZATION_TOKEN,
    },

    slack: {
      requestSigningSecret: process.env.SLACK_SIGNING_SECRET,
      botToken: process.env.SLACK_BOT_TOKEN,
    }
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;
  }

  return config;

})();
