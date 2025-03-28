import * as chai from 'chai';
const { expect } = chai;
import * as crypto from 'node:crypto';

import chaiNock from 'chai-nock';
import { StatusCodes } from 'http-status-codes';
import _ from 'lodash';
import nock from 'nock';
import * as sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { config } from '../config.js';

chai.use(sinonChai);
chai.use(chaiNock);

// eslint-disable-next-line mocha/no-top-level-hooks
beforeEach(function () {
  nock.disableNetConnect();
});

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(async function () {
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
    'x-hub-signature-256': 'sha256=' + hmac.digest('hex'),
  };
}

function createSlackWebhookSignatureHeaders(body) {
  const timestamp = Date.now();
  const version = 'v0';
  const hmac = crypto.createHmac('sha256', config.slack.requestSigningSecret);
  hmac.update(`${version}:${timestamp}:${body}`);

  return {
    'x-slack-signature': version + '=' + hmac.digest('hex'),
    'x-slack-request-timestamp': timestamp,
  };
}

function nockGithubWithNoConfigChanges() {
  const tags = nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/tags')
    .twice()
    .reply(200, [
      {
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
        },
      },
      {
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/456',
        },
      },
    ]);

  const commit1234 = nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/1234')
    .reply(200, {
      commit: {
        committer: {
          date: '2021-04-14T12:40:50.326Z',
        },
      },
    });

  const commit456 = nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/456')
    .reply(200, {
      commit: {
        committer: {
          date: '2021-04-10T12:40:50.326Z',
        },
      },
    });

  const commits = nock('https://api.github.com')
    .filteringPath(
      /since=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z&until=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z/g,
      'since=XXXX&until=XXXX',
    )
    .get('/repos/github-owner/github-repository/commits?since=XXXX&until=XXXX&path=api%2Fsrc%2Fshared%2Fconfig.js')
    .reply(200, []);

  const nocks = { tags, commit1234, commit456, commits };

  const checkAllNocksHaveBeenCalled = () => {
    _.values(nocks).map((nock) => {
      expect(nock).to.have.been.requested;
    });
  };

  return { nocks, checkAllNocksHaveBeenCalled };
}

function nockGithubWithConfigChanges() {
  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/tags')
    .twice()
    .reply(200, [
      {
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
        },
      },
      {
        commit: {
          url: 'https://api.github.com/repos/github-owner/github-repository/commits/456',
        },
      },
    ]);

  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/1234')
    .reply(200, {
      commit: {
        committer: {
          date: '2021-04-14T12:40:50.326Z',
        },
      },
    });

  nock('https://api.github.com')
    .get('/repos/github-owner/github-repository/commits/456')
    .reply(200, {
      commit: {
        committer: {
          date: '2021-04-10T12:40:50.326Z',
        },
      },
    });

  nock('https://api.github.com')
    .filteringPath(
      /since=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z&until=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z/g,
      'since=XXXX&until=XXXX',
    )
    .get('/repos/github-owner/github-repository/commits?since=XXXX&until=XXXX&path=api%2Fsrc%2Fshared%2Fconfig.js')
    .reply(200, [{}]);
}

function createScalingoTokenNock() {
  nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});
}
// eslint-disable-next-line mocha/no-exports
export {
  catchErr,
  createGithubWebhookSignatureHeader,
  createScalingoTokenNock,
  createSlackWebhookSignatureHeaders,
  expect,
  nock,
  nockGithubWithConfigChanges,
  nockGithubWithNoConfigChanges,
  sinon,
  StatusCodes,
};
