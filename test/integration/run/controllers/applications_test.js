import axios from 'axios';
import { describe, it } from 'mocha';

import { config } from '../../../../config.js';
import server from '../../../../server.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Integration | Run | Applications', function () {
  describe('#invalidateCdnCache', function () {
    it('should throw unauthorized error when api key provide are bad', async function () {
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

    describe('Success case', function () {
      it('should return a HTTP response with status code 200', async function () {
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

    describe('Fail case', function () {
      context('When application not have equivalent in namespace', function () {
        it('should return a HTTP response with status code 400', async function () {
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
