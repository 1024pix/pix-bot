import { config } from '../../../../config.js';
import cdnService from '../../../../run/services/cdn.js';
import { catchErr, expect, nock } from '../../../test-helper.js';

function _stubInvalidationCache() {
  return nock('https://my.imperva.com/api/prov/v2', {
    reqheaders: {
      'x-API-Id': config.cdn.apiId,
      'x-API-Key': config.cdn.apiKey,
      'Content-type': 'application/json',
    },
  })
    .delete(`/sites/1234/cache`)
    .reply(200);
}

describe('Integration | CDN', function () {
  let defaultRetryCount, defaultRetryDelay;

  before(function () {
    defaultRetryCount = config.cdn.CDNInvalidationRetryCount;
    defaultRetryDelay = config.cdn.CDNInvalidationRetryDelay;
    config.cdn.CDNInvalidationRetryCount = 3;
    config.cdn.CDNInvalidationRetryDelay = 1;
  });

  after(function () {
    config.cdn.CDNInvalidationRetryCount = defaultRetryCount;
    config.cdn.CDNInvalidationRetryDelay = defaultRetryDelay;
  });

  describe('#invalidateCdnCache', function () {
    it('should call Imperva cache invalidation API', async function () {
      // given
      const postInvalidationCache = _stubInvalidationCache();

      // when
      const result = await cdnService.invalidateCdnCache('pix-test');

      // then
      postInvalidationCache.done();
      expect(result).to.equal(`Cache CDN invalidé pour l‘application pix-test.`);
    });

    context('when cache invalidation fails', function () {
      context('when API returns an error', function () {
        it('should retry request 3 times on 500', async function () {
          // given
          let called = 0;
          const expectedCallCount = 1 + config.cdn.CDNInvalidationRetryCount;

          nock('https://my.imperva.com/api/prov/v2', {
            reqheaders: {
              'x-API-Id': config.cdn.apiId,
              'x-API-Key': config.cdn.apiKey,
              'Content-type': 'application/json',
            },
          })
            .delete(`/sites/1234/cache`)
            .times(4)
            .reply(500, function () {
              called++;
              return {
                title: 'SERVER_ERROR',
                status: 500,
                detail: 'The server could not invalidate the resources',
              };
            });

          // when
          const result = await catchErr(cdnService.invalidateCdnCache)('pix-test');

          // then
          const expected =
            'Request failed with status code 500 and message {"title":"SERVER_ERROR","status":500,"detail":"The server could not invalidate the resources"}';
          expect(result.message).to.be.equal(expected);
          expect(called).equal(expectedCallCount);
        });

        it('should not retry request on status code different than 500', async function () {
          // given
          let called = 0;
          const expectedCallCount = 1;

          nock('https://my.imperva.com/api/prov/v2', {
            reqheaders: {
              'x-API-Id': config.cdn.apiId,
              'x-API-Key': config.cdn.apiKey,
              'Content-type': 'application/json',
            },
          })
            .delete(`/sites/1234/cache`)
            .reply(400, function () {
              called++;
              return {
                title: 'Bad Request',
                status: 400,
                detail: 'JSON parse error: Unexpected character',
              };
            });

          // when
          const result = await catchErr(cdnService.invalidateCdnCache)('pix-test');

          // then
          const expected =
            'Request failed with status code 400 and message {"title":"Bad Request","status":400,"detail":"JSON parse error: Unexpected character"}';
          expect(result.message).to.be.equal(expected);
          expect(called).equal(expectedCallCount);
        });

        it('should throw an error with statusCode and message', async function () {
          // given
          nock('https://my.imperva.com/api/prov/v2', {
            reqheaders: {
              'x-API-Id': config.cdn.apiId,
              'x-API-Key': config.cdn.apiKey,
              'Content-type': 'application/json',
            },
          })
            .delete(`/sites/1234/cache`)
            .reply(400, function () {
              return {
                title: 'Bad Request',
                status: 400,
                detail: 'JSON parse error: Unexpected character',
              };
            });

          // when
          const result = await catchErr(cdnService.invalidateCdnCache)('pix-test');

          // then
          const expected =
            'Request failed with status code 400 and message {"title":"Bad Request","status":400,"detail":"JSON parse error: Unexpected character"}';
          expect(result.message).to.be.equal(expected);
        });
      });
    });
  });
});
