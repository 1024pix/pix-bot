import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import { release } from '../../../../common/services/releases.js';
import github from '../../../../common/services/github.js';
import ScalingoClient from '../../../../common/services/scalingo-client.js';

describe('Unit | release', function () {
  let exec;

  beforeEach(function () {
    exec = sinon.stub().callsFake(async () => Promise.resolve({ stdout: 'some heavy logs\n3.14.0\n', stderr: '' }));
  });

  describe('#deployPixRepo', function () {
    it('should deploy the pix site', async function () {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.withArgs('app-name', 'v1.0.0', 'pix-site').resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').withArgs('production').resolves(scalingoClient);

      // when
      const response = await release.deployPixRepo('Pix-Site', 'app-name', 'V1.0.0 ', 'production');

      // then
      expect(response).to.equal('OK');
    });
  });

  describe('#deploy', function () {
    it('should return application deployment status', async () => {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      // when
      const response = await release.deploy('production', 'v1.0');
      // then
      expect(response).to.deep.equal(['OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK']);
    });

    it('should ask scalingo to deploy applications', async () => {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      // when
      await release.deploy('production', 'v1.0 ');
      // then
      expect(scalingoClient.deployFromArchive.callCount).to.equal(7);
      expect(scalingoClient.deployFromArchive.args).to.deep.equal([
        ['pix-app', 'v1.0'],
        ['pix-certif', 'v1.0'],
        ['pix-admin', 'v1.0'],
        ['pix-orga', 'v1.0'],
        ['pix-api', 'v1.0'],
        ['pix-1d', 'v1.0'],
        ['pix-audit-logger', 'v1.0'],
      ]);
    });

    it('should sanitize release tag', async () => {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.resolves('OK');
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      const tag = ' V1.0.0 ';
      // when
      await release.deploy('production', tag);
      // then
      expect(scalingoClient.deployFromArchive.callCount).to.equal(7);
      expect(scalingoClient.deployFromArchive.firstCall.args[1]).to.equal('v1.0.0');
    });

    it('should throw an error when an application deployment fails', async () => {
      // given
      const scalingoClient = new ScalingoClient(null, 'production');
      scalingoClient.deployFromArchive = sinon.stub();
      scalingoClient.deployFromArchive.rejects(new Error('KO'));
      sinon.stub(ScalingoClient, 'getInstance').resolves(scalingoClient);
      // when
      try {
        await release.deploy('production', 'v1.0');
        expect.fail('Should throw an error when an application deployment fails');
      } catch (e) {
        expect(e.message).to.equal('KO');
      }
    });
  });

  describe('#publish', function () {
    it('should call the publish script', async function () {
      //when
      await release.publish('minor', '', exec);

      // then
      sinon.assert.calledWith(
        exec,
        sinon.match(
          new RegExp('.*(/scripts/publish.sh minor https://undefined@github.com/github-owner/github-repository.git )$'),
        ),
      );
    });

    it('should call the publish script with the branch name', async function () {
      //when
      await release.publish('minor', 'hotfix', exec);

      // then
      sinon.assert.calledWith(
        exec,
        sinon.match(
          new RegExp(
            '.*(/scripts/publish.sh minor https://undefined@github.com/github-owner/github-repository.git hotfix)$',
          ),
        ),
      );
    });

    it('should retrieve new package version', async function () {
      //when
      const newPackageVersion = await release.publish('minor', '', exec);

      // then
      expect(newPackageVersion).to.equal('3.14.0');
    });
  });

  describe('#publishPixRepo', function () {
    beforeEach(function () {
      // given
      sinon.stub(github, 'getDefaultBranch').resolves('dev');
    });

    it("should call the release pix script with 'minor'", async function () {
      //when
      await release.publishPixRepo('pix-site', 'minor', exec);

      // then
      sinon.assert.calledWith(
        exec,
        sinon.match(
          new RegExp(
            '.*(/scripts/release-pix-repo.sh) github-owner pix-site minor dev https://undefined@github.com/github-owner/pix-site.git$',
          ),
        ),
      );
    });

    it('should retrieve new package version', async function () {
      //when
      const newPackageVersion = await release.publishPixRepo('pix-site', 'minor', exec);

      // then
      expect(newPackageVersion).to.equal('3.14.0');
    });
  });
});
