const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const nock = require('nock');

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

module.exports = {
  catchErr,
  expect,
  nock,
  sinon,
};
