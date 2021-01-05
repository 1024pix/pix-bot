const { expect } = require('chai');
const sinon = require('sinon');
const nock = require('nock');

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

module.exports = {
  catchErr,
  expect,
  nock,
  sinon,
};
