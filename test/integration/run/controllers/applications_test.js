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
        url: `/applications/pix-site/cdn-cache-invalidations?apiKey=${badApiKey}`,
      });

      // then
      expect(response.statusCode).to.equal(401);
    });

    describe('Success case', function () {
      it('should return a HTTP response with status code 200', async function () {
        // given
        const apiKey = config.openApi.authorizationToken;
        sinon.stub(axios, 'delete').resolves();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/applications/pix-test/cdn-cache-invalidations?apiKey=${apiKey}`,
        });

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
