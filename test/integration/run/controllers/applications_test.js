const axios = require('axios');
const { describe, it } = require('mocha');
const { expect, sinon } = require('../../../test-helper');
const server = require('../../../../server');
const config = require('../../../../config');

describe('Integration | Run | Applications', () => {
  describe('#invalidateCdnCache', () => {
    it('should throw unauthorized error when api key provide are bad', async () => {
      // given
      const badApiKey = 'bad-api-key';

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/applications/test/cdn-cache-invalidations?apiKey=${badApiKey}`,
      });

      // then
      expect(response.statusCode).to.equal(401);
    });

    describe('Success case', () => {
      it('should return a HTTP response with status code 200', async () => {
        // given
        const apiKey = config.openApi.authorizationToken;
        const namespace = 'Pix_Namespace';
        sinon.stub(axios, 'get').resolves({ data: { namespaces: { 'namespace-keyY4DBF': namespace } } });
        sinon.stub(axios, 'post').resolves();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/applications/Pix_Test/cdn-cache-invalidations?apiKey=${apiKey}`,
        });

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('Fail case', () => {
      context('When application not have equivalent in namespace', function () {
        it('should return a HTTP response with status code 400', async () => {
          // given
          const apiKey = config.openApi.authorizationToken;
          const application = 'Not-existing-application';
          const namespace = 'Pix_Namespace';
          sinon.stub(axios, 'get').resolves({ data: { namespaces: { 'namespace-keyY4DBF': namespace } } });
          sinon.stub(axios, 'post').resolves();

          // when
          const response = await server.inject({
            method: 'POST',
            url: `/applications/${application}/cdn-cache-invalidations?apiKey=${apiKey}`,
          });

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });
});
