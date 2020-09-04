const { describe, it } = require('mocha');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');
const { expect } = require('chai');
const releasesService = require('../../../lib/services/releases');
const ScalingoClient = require('../../../lib/services/scalingo-client');

describe('releases', function() {
  let exec;
  let releasesService;

  before(() => {
    exec = sinon.stub().callsFake(async () => Promise.resolve({stdout: '', stderr: ''}));
    releasesService = proxyquire('../../../lib/services/releases', {
      'child_process': {exec},
      util: {promisify: fn => fn}
    });
  });

  describe('#publish', async function () {
    it('should call the publish script', async function () {
      //when
      await releasesService.publish('minor');

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/publish.sh minor)')));
    });
  });

  describe('#publishPixRepo', async function () {
    it('should call the release pix pro script with \'minor\'', async function () {
      //when
      await releasesService.publishPixRepo('pix-site-pro', 'minor');

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/release-pix-repo.sh) github-owner pix-site-pro minor$')));
    });
  });

  describe('#deployPixSite', async function() {
    it('should deploy the pix site pro', async function() {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.withArgs('app-name', 'v1.0.0', 'pix-site-pro').resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      // when
      const response = await releasesService.deployPixSite('Pix-Site-Pro', 'app-name', 'V1.0.0 ');
      // then
      expect(response).to.equal('OK');
    });
  });

  describe('#createAndDeployPro', async function () {
    it('should call the release pix pro script with default', async function () {
      //when
      await releasesService.releaseAndDeployPixPro();

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/release-pix-repo.sh github-owner pix-pro)')));
    });

    it('should call the release pix pro script with \'minor\'', async function () {
      //when
      await releasesService.releaseAndDeployPixPro('minor');

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/release-pix-repo.sh github-owner pix-pro minor)')));
    });
  });
});

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

  describe('#deployPixUI', async function () {
    let exec, releasesService;

    before(() => {
      exec = sinon.stub().callsFake(async () => Promise.resolve({stdout: '', stderr: ''}));
      releasesService = proxyquire('../../../lib/services/releases', {
        'child_process': {exec},
        util: {promisify: fn => fn}
      });
    });

    it('should call the deploy Pix-UI script with default', async function () {
      //when
      await releasesService.deployPixUI('pix-ui');

      // then
      sinon.assert.calledWith(exec, sinon.match(new RegExp('.*(/scripts/deploy-pix-ui.sh)')));
    });

  });
});
