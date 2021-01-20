const { describe, it } = require('mocha');
const sinon = require('sinon');
const { expect } = require('chai');
const releasesService = require('../../../../build/services/releases');
const ScalingoClient = require('../../../../common/services/scalingo-client');

describe('#deploy', async function () {
  it('should trigger deployments of managed applications', async () => {
    // given
    const scalingoClient = new ScalingoClient(null, 'production');
    scalingoClient.deployFromArchive = sinon.stub();
    scalingoClient.deployFromArchive.resolves('OK');
    sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
    // when
    const response = await releasesService.deploy('production', 'v1.0');
    // then
    sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-app1', 'v1.0');
    sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-app2', 'v1.0');
    sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-app3', 'v1.0');
    expect(response).to.deep.equal(['OK', 'OK', 'OK']);
  });

  it('should trigger deployments of managed applications', async () => {
    // given
    const scalingoClient = new ScalingoClient(null, 'production');
    scalingoClient.deployFromArchive = sinon.stub();
    scalingoClient.deployFromArchive.rejects(new Error('KO'));
    sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
    // when
    try {
      await releasesService.deploy('production', 'v1.0');
      expect.fail('Should throw an error when an application deployment fails');
    } catch (e) {
      expect(e.message).to.equal('KO');
    }
  });
});
