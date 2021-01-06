const { describe, it } = require('mocha');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');
const { expect } = require('chai');
const ScalingoClient = require('../../../../common/services/scalingo-client');

describe('releases', function() {
  let exec;
  let releasesService;

  before(() => {
    exec = sinon.stub().callsFake(async () => Promise.resolve({stdout: '', stderr: ''}));
    releasesService = proxyquire('../../../../run/services/releases', {
      'child_process': {exec},
      util: {promisify: fn => fn}
    });
  });

  describe('#deployPixRepo', async function() {
    it('should deploy the pix site', async function() {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.withArgs('app-name', 'v1.0.0', 'pix-site').resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      // when
      const response = await releasesService.deployPixRepo('Pix-Site', 'app-name', 'V1.0.0 ');
      // then
      expect(response).to.equal('OK');
    });
  });
});
