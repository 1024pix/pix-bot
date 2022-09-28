const axios = require('axios');
const nock = require('nock');
const { describe, it } = require('mocha');
const { expect, sinon } = require('../../../test-helper');
const server = require('../../../../server');
const config = require('../../../../config');

describe.only('Integration | Run | Metabase', () => {
  beforeEach(() => {
    nock.enableNetConnect();
  });
  afterEach(() => {
    nock.disableNetConnect();
  });
  describe('#duplicate', () => {
    it('should connect to metabase', async () => {
      // given

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/run/metabase/duplicate`,
        payload: {
          'dashboard-id': 738,
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
