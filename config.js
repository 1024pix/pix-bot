import process from 'node:process';

function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

function _getJSON(value) {
  if (!value) {
    return undefined;
  }

  return JSON.parse(value);
}

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

const configuration = (function () {
  const config = {
    port: _getNumber(process.env.PORT, 3000),
    environment: process.env.NODE_ENV || 'development',

    ecoMode: {
      stopSchedule: process.env.REVIEW_APP_STOP_SCHEDULE,
      startSchedule: process.env.REVIEW_APP_START_SCHEDULE,
    },

    baleen: {
      pat: process.env.BALEEN_PERSONAL_ACCESS_TOKEN,
      appNamespaces: _getJSON(process.env.BALEEN_APP_NAMESPACES),
      CDNInvalidationRetryCount: _getNumber(process.env.BALEEN_CDN_INVALIDATION_RETRY_COUNT, 3),
      CDNInvalidationRetryDelay: _getNumber(process.env.BALEEN_CDN_INVALIDATION_RETRY_DELAY, 2000),
    },

    scalingo: {
      oscFr1Url: 'https://dashboard.scalingo.com/apps/osc-fr1',
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
      },
      validAppSuffix: _getJSON(process.env.SCALINGO_VALID_APP_SUFFIX) || [
        'production',
        'review',
        'integration',
        'recette',
        'sandbox',
        'dev',
        'router',
        'test',
      ],
      validAppPrefix: 'pix',
      validAppNbCharMax: 46,
      validAppNbCharMin: 6,
      maxLogLength: process.env.MAX_LOG_LENGTH || 1000,
      repositoryToScalingoIntegration: {
        pix: [
          'pix-api-integration',
          'pix-audit-logger-integration',
          'pix-app-integration',
          'pix-certif-integration',
          'pix-orga-integration',
          'pix-admin-integration',
          'pix-junior-integration',
        ],
      },
    },

    openApi: {
      authorizationToken: process.env.AUTHORIZATION_TOKEN,
    },

    slack: {
      requestSigningSecret: process.env.SLACK_SIGNING_SECRET || 'slack-super-signing-secret',
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
      idA11Y: process.env.GOOGLE_SHEET_A11Y,
    },

    prismic: {
      secret: process.env.PRISMIC_SECRET,
    },

    pixSiteDeploy: {
      schedule: process.env.PIX_SITE_DEPLOY_SCHEDULE,
    },

    tasks: {
      autoScaleEnabled: isFeatureEnabled(process.env.FT_AUTOSCALE_WEB),
      scheduleAutoScaleUp: process.env.SCHEDULE_AUTOSCALE_UP || '* 0 8 * * *',
      scheduleAutoScaleDown: process.env.SCHEDULE_AUTOSCALE_DOWN || '* 0 19 * * *',
      autoScaleApplicationName: process.env.SCHEDULE_AUTOSCALE_APP_NAME,
      autoScaleRegion: process.env.SCHEDULE_AUTOSCALE_REGION,
      autoScaleUpSettings: {
        min: process.env.SCHEDULE_AUTOSCALE_UP_SETTINGS_MIN,
        max: process.env.SCHEDULE_AUTOSCALE_UP_SETTINGS_MAX,
      },
      autoScaleDownSettings: {
        min: process.env.SCHEDULE_AUTOSCALE_DOWN_SETTINGS_MIN,
        max: process.env.SCHEDULE_AUTOSCALE_DOWN_SETTINGS_MAX,
      },
    },

    PIX_REPO_NAME: 'pix',
    PIX_BOT_REPO_NAME: 'pix-bot',
    PIX_BOT_APPS: {
      production: ['pix-bot-run-production'],
      recette: ['pix-bot-build-production'],
    },
    PIX_LCMS_REPO_NAME: 'pix-editor',
    PIX_LCMS_APPS: {
      production: ['pix-lcms-production'],
      recette: ['pix-lcms-minimal-production'],
    },
    PIX_API_DATA_APPS: {
      production: ['pix-api-data-production'],
    },
    PIX_UI_REPO_NAME: 'pix-ui',
    PIX_EMBER_TESTING_LIBRARY_REPO_NAME: 'ember-testing-library',
    PIX_DB_STATS_REPO_NAME: 'pix-db-stats',
    PIX_DB_STATS_APPS_NAME: ['pix-db-stats'],
    PIX_SITE_REPO_NAME: 'pix-site',
    PIX_SITE_APPS: ['pix-site', 'pix-pro'],
    PIX_DATAWAREHOUSE_REPO_NAME: 'pix-db-replication',
    PIX_DATAWAREHOUSE_APPS_NAME: ['pix-datawarehouse', 'pix-datawarehouse-ex', 'pix-datawarehouse-data'],

    PIX_APPS: ['app', 'certif', 'admin', 'orga', 'api', 'junior', 'audit-logger'],
    PIX_APPS_ENVIRONMENTS: ['integration', 'recette', 'production'],
    PIX_TUTOS_REPO_NAME: 'pix-tutos',
    PIX_TUTOS_APP_NAME: 'pix-tutos',
    PIX_AIRFLOW_APP_NAME: 'pix-airflow-production',
    PIX_DBT_APPS_NAME: ['pix-dbt-production', 'pix-dbt-external-production'],
    PIX_API_TO_PG_APPS_NAME: ['pix-api-to-pg-production'],

    repoAppNames: _getJSON(process.env.REPO_APP_NAMES_MAPPING) || {},
  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.baleen.pat = 'baleen-pat';
    config.baleen.appNamespaces = _getJSON('{"Pix_Test":"Pix_Namespace","Pix_Test_2":"Pix Namespace 2"}');

    config.github.token = undefined;
    config.github.owner = 'github-owner';
    config.github.repository = 'github-repository';
    config.github.webhookSecret = 'github-webhook-secret';

    config.openApi.authorizationToken = 'open-api-token';

    config.scalingo.reviewApps.token = 'tk-us-scalingo-token-reviewApps';
    config.scalingo.reviewApps.apiUrl = 'https://scalingo.reviewApps';
    config.scalingo.integration.token = 'tk-us-scalingo-token-integration';
    config.scalingo.integration.apiUrl = 'https://scalingo.integration';
    config.scalingo.recette.token = 'tk-us-scalingo-token-recette';
    config.scalingo.recette.apiUrl = 'https://scalingo.recette';
    config.scalingo.production.token = 'tk-us-scalingo-token-production';
    config.scalingo.production.apiUrl = 'https://scalingo.production';

    config.prismic.secret = 'prismic-secret';
  }

  return config;
})();

export { configuration as config };
