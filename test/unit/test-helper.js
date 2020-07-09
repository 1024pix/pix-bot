const sinon = require('sinon');
const nock = require('nock');

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(function () {
  sinon.restore();
});

module.exports = {
  sinon,
  nock,
};
