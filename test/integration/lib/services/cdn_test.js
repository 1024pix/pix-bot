const { describe, it } = require('mocha');
const { catchErr, expect, nock } = require('../../../test-helper');
const config = require('../../../../lib/config');

const cdn = require('../../../../lib/services/cdn');

function _stubAccountDetails(namespace) {
  return nock('https://console.baleen.cloud/api', {
    reqheaders: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
    }
  })
    .get('/account')
    .reply(200, {
      namespaces : {
        'namespace-key2': 'Test2',
        'namespace-key1': namespace,
      }
    });
}

function _stubInvalidationCachePost(namespaceKey) {
  return nock('https://console.baleen.cloud/api', {
    reqheaders: {
      'X-Api-Key': config.baleen.pat,
      'Content-type': 'application/json',
      'Cookie': `baleen-namespace=${namespaceKey}`
    }
  })
    .post('/cache/invalidations', { patterns: ['.']})
    .reply(200);
}

describe('Integration | CDN', () => {
  describe('#invalidateCdnCache', () => {
    it('should call Baleen cache invalidation API', async () => {
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

    it('should use namespace-key of application to create cookie', async () => {
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

    it('should throw an error when namespace does not exist', async () => {
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
      expect(result.message).to.be.equal('Namespace for the application: Not_existing_application are not found');
    });
  });
});
