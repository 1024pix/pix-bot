import { describe, it } from 'mocha';

import { config } from '../../../../config.js';
import * as cdn from '../../../../run/services/cdn.js';
import { catchErr, expect, nock } from '../../../test-helper.js';

function _stubAccountDetails(namespace) {
  return nock('https://console.baleen.cloud/api', {
    reqheaders: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
    },
  })
    .get('/account')
    .reply(200, {
      namespaces: {
        'namespace-key2': 'Test2',
        'namespace-key1': namespace,
      },
    });
}

function _stubInvalidationCachePost(namespaceKey) {
  return nock('https://console.baleen.cloud/api', {
    reqheaders: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
      Cookie: `baleen-namespace=${namespaceKey}`,
    },
  })
    .post('/cache/invalidations', { patterns: ['.'] })
    .reply(200);
}

function _stubCustomStaticRulePost(namespaceKey, monitorId, ip, ja3) {
  return nock('https://console.baleen.cloud/api', {
    reqheaders: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
      Cookie: `baleen-namespace=${namespaceKey}`,
    },
  })
    .post('/configs/custom-static-rules', {
      category: 'block',
      name: `Blocage ip: ${ip} ja3: ${ja3}`,
      description: `Blocage automatique depuis le monitor Datadog ${monitorId}`,
      enabled: true,
      labels: ['automatic-rule'],
      conditions: [
        [
          { type: 'ip', operator: 'match', value: ip },
          { type: 'ja3', operator: 'equals', value: ja3 },
        ],
      ],
    })
    .reply(200);
}

describe('Integration | CDN', function () {
  let defaultRetryCount, defaultRetryDelay;

  before(function () {
    defaultRetryCount = config.baleen.CDNInvalidationRetryCount;
    defaultRetryDelay = config.baleen.CDNInvalidationRetryDelay;
    config.baleen.CDNInvalidationRetryCount = 3;
    config.baleen.CDNInvalidationRetryDelay = 1;
  });

  after(function () {
    config.baleen.CDNInvalidationRetryCount = defaultRetryCount;
    config.baleen.CDNInvalidationRetryDelay = defaultRetryDelay;
  });

  describe('#invalidateCdnCache', function () {
    it('should call Baleen cache invalidation API', async function () {
      // given
      const applicationName = 'Pix_Test';
      const namespace = 'Pix_Namespace';
      const namespaceKey = 'namespace-key1';

      _stubAccountDetails(namespace);

      const postInvalidationCache = _stubInvalidationCachePost(namespaceKey);

      // when
      const result = await cdn.invalidateCdnCache(applicationName);

      // then
      postInvalidationCache.done();
      expect(result).to.equal(`Cache CDN invalidé pour l‘application ${applicationName}.`);
    });

    it('should use namespace-key of application to create cookie', async function () {
      // given
      const applicationName = 'Pix_Test';
      const namespace = 'Pix_Namespace';
      const namespaceKey = 'namespace-key1';

      const getAccountDetails = _stubAccountDetails(namespace);
      _stubInvalidationCachePost(namespaceKey);

      // when
      await cdn.invalidateCdnCache(applicationName);

      // then
      getAccountDetails.done();
    });

    context('when cache invalidation fails', function () {
      context('when namespace does not exist', function () {
        it('should throw an NamespaceNotFoundError error ', async function () {
          // given
          const applicationName = 'Not_existing_application';

          const namespace = 'Pix_Namespace';
          const namespaceKey = 'namespace-key1';

          _stubAccountDetails(namespace);
          _stubInvalidationCachePost(namespaceKey);

          // when
          const result = await catchErr(cdn.invalidateCdnCache)(applicationName);

          // then
          expect(result).to.be.instanceOf(cdn.NamespaceNotFoundError);
          expect(result.message).to.be.equal('A namespace could not been found.');
        });
      });

      context('when API returns an error', function () {
        it('should retry request 3 times on 500', async function () {
          // given
          const applicationName = 'Pix_Test';
          const namespace = 'Pix_Namespace';
          const namespaceKey = 'namespace-key1';
          let called = 0;
          const expectedCallCount = 1 + config.baleen.CDNInvalidationRetryCount;

          _stubAccountDetails(namespace);

          nock('https://console.baleen.cloud/api', {
            reqheaders: {
              'X-Api-Key': config.baleen.pat,
              'Content-type': 'application/json',
              Cookie: `baleen-namespace=${namespaceKey}`,
            },
          })
            .post('/cache/invalidations', { patterns: ['.'] })
            .times(4)
            .reply(500, function () {
              called++;
              return {
                type: 'https://www.jhipster.tech/problem/problem-with-message',
                title: 'SERVER_ERROR',
                status: 500,
                detail: 'The server could not invalidate the resources',
                path: '/api/cache/invalidations',
                message: 'error.http.500',
              };
            });

          // when
          const result = await catchErr(cdn.invalidateCdnCache)(applicationName);

          // then
          const expected =
            'Request failed with status code 500 and message {"type":"https://www.jhipster.tech/problem/problem-with-message","title":"SERVER_ERROR","status":500,"detail":"The server could not invalidate the resources","path":"/api/cache/invalidations","message":"error.http.500"}';
          expect(result.message).to.be.equal(expected);
          expect(called).equal(expectedCallCount);
        });

        it('should not retry request on status code different than 500', async function () {
          // given
          const applicationName = 'Pix_Test';
          const namespace = 'Pix_Namespace';
          const namespaceKey = 'namespace-key1';
          let called = 0;
          const expectedCallCount = 1;

          _stubAccountDetails(namespace);

          nock('https://console.baleen.cloud/api', {
            reqheaders: {
              'X-Api-Key': config.baleen.pat,
              'Content-type': 'application/json',
              Cookie: `baleen-namespace=${namespaceKey}`,
            },
          })
            .post('/cache/invalidations', { patterns: ['.'] })
            .reply(400, function () {
              called++;
              return {
                type: 'https://www.jhipster.tech/problem/problem-with-message',
                title: 'Bad Request',
                status: 400,
                detail: 'JSON parse error: Unexpected character',
                path: '/api/cache/invalidations',
                message: 'error.http.400',
              };
            });

          // when
          const result = await catchErr(cdn.invalidateCdnCache)(applicationName);

          // then
          const expected =
            'Request failed with status code 400 and message {"type":"https://www.jhipster.tech/problem/problem-with-message","title":"Bad Request","status":400,"detail":"JSON parse error: Unexpected character","path":"/api/cache/invalidations","message":"error.http.400"}';
          expect(result.message).to.be.equal(expected);
          expect(called).equal(expectedCallCount);
        });

        it('should throw an error with statusCode and message', async function () {
          // given
          const applicationName = 'Pix_Test';
          const namespace = 'Pix_Namespace';
          const namespaceKey = 'namespace-key1';

          _stubAccountDetails(namespace);

          nock('https://console.baleen.cloud/api', {
            reqheaders: {
              'X-Api-Key': config.baleen.pat,
              'Content-type': 'application/json',
              Cookie: `baleen-namespace=${namespaceKey}`,
            },
          })
            .post('/cache/invalidations', { patterns: ['.'] })
            .reply(400, {
              type: 'https://www.jhipster.tech/problem/problem-with-message',
              title: 'Bad Request',
              status: 400,
              detail: 'JSON parse error: Unexpected character',
              path: '/api/cache/invalidations',
              message: 'error.http.400',
            });

          // when
          const result = await catchErr(cdn.invalidateCdnCache)(applicationName);

          // then
          const expected =
            'Request failed with status code 400 and message {"type":"https://www.jhipster.tech/problem/problem-with-message","title":"Bad Request","status":400,"detail":"JSON parse error: Unexpected character","path":"/api/cache/invalidations","message":"error.http.400"}';
          expect(result.message).to.be.equal(expected);
        });
      });
    });
  });

  describe('#blockAccess', function () {
    describe('when ip is not defined', function () {
      it('should throw an error', async function () {
        // given
        const ja3 = 'ja3';
        const monitorId = 'monitorId';

        // when
        const error = await catchErr(cdn.blockAccess)({ ja3, monitorId });

        // then
        expect(error.message).to.equal('ip cannot be empty.');
      });
    });

    describe('when ip is empty', function () {
      it('should throw an error', async function () {
        // given
        const ip = '';
        const ja3 = 'ja3';
        const monitorId = 'monitorId';

        // when
        const error = await catchErr(cdn.blockAccess)({ ip, ja3, monitorId });

        // then
        expect(error.message).to.equal('ip cannot be empty.');
      });
    });

    describe('when ja3 is not defined', function () {
      it('should throw an error', async function () {
        // given
        const ip = 'ip';
        const monitorId = 'monitorId';

        // when
        const error = await catchErr(cdn.blockAccess)({ ip, monitorId });

        // then
        expect(error.message).to.equal('ja3 cannot be empty.');
      });
    });

    describe('when ja3 is empty', function () {
      it('should throw an error', async function () {
        // given
        const ip = 'ip';
        const ja3 = '';
        const monitorId = 'monitorId';

        // when
        const error = await catchErr(cdn.blockAccess)({ ip, ja3, monitorId });

        // then
        expect(error.message).to.equal('ja3 cannot be empty.');
      });
    });

    it('should call Baleen custom static rules API', async function () {
      // given
      const namespace = 'Pix_Namespace';
      const namespaceKey = 'namespace-key1';
      const monitorId = '1234';
      const ip = '127.0.0.1';
      const ja3 = '9709730930';

      _stubAccountDetails(namespace);

      const postCustomStaticRules = _stubCustomStaticRulePost(namespaceKey, monitorId, ip, ja3);

      // when
      const result = await cdn.blockAccess({ ip, ja3, monitorId });

      // then
      postCustomStaticRules.done();
      expect(result).to.equal('Règle de blocage mise en place.');
    });

    it('should throw an error with statusCode and message', async function () {
      // given
      const namespace = 'Pix_Namespace';
      const namespaceKey = 'namespace-key1';
      const monitorId = '1234';
      const ip = '127.0.0.1';
      const ja3 = '9709730930';

      _stubAccountDetails(namespace);

      nock('https://console.baleen.cloud/api', {
        reqheaders: {
          'X-Api-Key': config.baleen.pat,
          'Content-type': 'application/json',
          Cookie: `baleen-namespace=${namespaceKey}`,
        },
      })
        .post('/configs/custom-static-rules', {
          category: 'block',
          name: `Blocage ip: ${ip} ja3: ${ja3}`,
          description: `Blocage automatique depuis le monitor Datadog ${monitorId}`,
          enabled: true,
          labels: ['automatic-rule'],
          conditions: [
            [
              { type: 'ip', operator: 'match', value: ip },
              { type: 'ja3', operator: 'equals', value: ja3 },
            ],
          ],
        })
        .reply(400, {
          type: 'https://www.jhipster.tech/problem/problem-with-message',
          title: 'Bad Request',
          status: 400,
          detail: 'JSON parse error: Unexpected character',
          path: '/configs/custom-static-rules',
          message: 'error.http.400',
        });

      // when
      const result = await catchErr(cdn.blockAccess)({ monitorId, ip, ja3 });

      // then
      const expected =
        'Request failed with status code 400 and message {"type":"https://www.jhipster.tech/problem/problem-with-message","title":"Bad Request","status":400,"detail":"JSON parse error: Unexpected character","path":"/configs/custom-static-rules","message":"error.http.400"}';
      expect(result.message).to.be.equal(expected);
    });
  });
});
