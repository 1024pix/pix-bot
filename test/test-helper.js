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

module.exports = {
  catchErr,
  expect,
  nock,
  sinon,
  createGithubWebhookSignatureHeader,
};
