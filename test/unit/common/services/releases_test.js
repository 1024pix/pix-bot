const { describe, it } = require('mocha');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = require('chai');
const ScalingoClient = require('../../../../common/services/scalingo-client');
const github = require('../../../../common/services/github');

describe('releases', function () {
  let exec;
  let releasesService;

  beforeEach(function () {
    exec = sinon.stub().callsFake(async () => Promise.resolve({ stdout: 'some heavy logs\n3.14.0\n', stderr: '' }));
    releasesService = proxyquire('../../../../common/services/releases', {
      child_process: { exec },
      util: { promisify: (fn) => fn },
    });
  });

  describe('#deployPixRepo', function () {
    it('should deploy the pix site', async function () {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.withArgs('app-name', 'v1.0.0', 'pix-site').resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').withArgs('production').resolves(scalingoClient);

      // when
      const response = await releasesService.deployPixRepo('Pix-Site', 'app-name', 'V1.0.0 ', 'production');

      // then
      expect(response).to.equal('OK');
    });
  });

  describe('#deploy', function () {
    it('should trigger deployments of managed applications', async () => {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      // when
      const response = await releasesService.deploy('production', 'v1.0');
      // then
      sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-app', 'v1.0');
      sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-certif', 'v1.0');
      sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-admin', 'v1.0');
      sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-orga', 'v1.0');
      sinon.assert.calledWithExactly(scalingoClient.deployFromArchive, 'pix-api', 'v1.0');
      expect(response).to.deep.equal(['OK', 'OK', 'OK', 'OK', 'OK']);
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

  describe('#publish', function () {
    it('should call the publish script', async function () {
      //when
      await releasesService.publish('minor');

      // then
      sinon.assert.calledWith(
        exec,
        sinon.match(
          new RegExp('.*(/scripts/publish.sh minor https://undefined@github.com/github-owner/github-repository.git )$')
        )
      );
    });

    it('should call the publish script with the branch name', async function () {
      //when
      await releasesService.publish('minor', 'hotfix');

      // then
      sinon.assert.calledWith(
        exec,
        sinon.match(
          new RegExp(
            '.*(/scripts/publish.sh minor https://undefined@github.com/github-owner/github-repository.git hotfix)$'
          )
        )
      );
    });

    it('should retrieve new package version', async function () {
      //when
      const newPackageVersion = await releasesService.publish('minor');

      // then
      expect(newPackageVersion).to.equal('3.14.0');
    });
  });

  describe('#publishPixRepo', function () {
    it("should call the release pix script with 'minor'", async function () {
      // given
      sinon.stub(github, 'getDefaultBranch').resolves('dev');

      //when
      await releasesService.publishPixRepo('pix-site', 'minor');

      // then
      sinon.assert.calledWith(
        exec,
        sinon.match(
          new RegExp(
            '.*(/scripts/release-pix-repo.sh) github-owner pix-site minor dev https://undefined@github.com/github-owner/pix-site.git$'
          )
        )
      );
    });
  });
});
