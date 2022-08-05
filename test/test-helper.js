const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const nock = require('nock');
const crypto = require('crypto');
const config = require('../config');

chai.use(require('sinon-chai'));

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(function () {
  sinon.restore();
  nock.cleanAll();
});

function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
      return 'should have thrown an error';
    } catch (err) {
      return err;
    }
  };
}

function createGithubWebhookSignatureHeader(body) {
  const hmac = crypto.createHmac('sha256', config.github.webhookSecret);
  hmac.update(body);

  return {
    'x-hub-signature-256': 'sha256='+ hmac.digest('hex'),
  };
}

function createSlackWebhookSignatureHeaders(body) {
  const timestamp = Date.now();
  const version = 'v0';
  const hmac = crypto.createHmac('sha256', config.slack.requestSigningSecret);
  hmac.update(`${version}:${timestamp}:${body}`);

  return {
    'x-slack-signature': version +'='+ hmac.digest('hex'),
    'x-slack-request-timestamp': timestamp
  };
}

function nockGithubWithNoConfigChanges() {
  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/tags')
    .twice()
    .reply(200, [
      {
        'commit': {
          'url': 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
        },
      },
      {
        'commit': {
          'url': 'https://api.github.com/repos/github-owner/github-repository/commits/456',
        },
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/1234')
    .reply(200, {
      commit: {
        'committer': {
          'date': '2021-04-14T12:40:50.326Z'
        },
      }
    });

  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/456')
    .reply(200, {
      commit: {
        'committer': {
          'date': '2021-04-10T12:40:50.326Z'
        },
      }
    });

  nock('https://api.github.com')
    .filteringPath(/since=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z&until=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z/g, 'since=XXXX&until=XXXX')
    .get('/repos/github-owner/github-repository/commits?since=XXXX&until=XXXX&path=api%2Flib%2Fconfig.js')
    .reply(200, []);
}

function nockGithubWithConfigChanges() {
  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/tags')
    .twice()
    .reply(200, [
      {
        'commit': {
          'url': 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
        },
      },
      {
        'commit': {
          'url': 'https://api.github.com/repos/github-owner/github-repository/commits/456',
        },
      }
    ]);

  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/1234')
    .reply(200, {
      commit: {
        'committer': {
          'date': '2021-04-14T12:40:50.326Z'
        },
      }
    });

  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/456')
    .reply(200, {
      commit: {
        'committer': {
          'date': '2021-04-10T12:40:50.326Z'
        },
      }
    });

  nock('https://api.github.com')
    .filteringPath(/since=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z&until=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z/g, 'since=XXXX&until=XXXX')
    .get('/repos/github-owner/github-repository/commits?since=XXXX&until=XXXX&path=api%2Flib%2Fconfig.js')
    .reply(200, [{}]);
}

module.exports = {
  catchErr,
  expect,
  nock,
  sinon,
  createGithubWebhookSignatureHeader,
  createSlackWebhookSignatureHeaders,
  nockGithubWithConfigChanges,
  nockGithubWithNoConfigChanges,
};
