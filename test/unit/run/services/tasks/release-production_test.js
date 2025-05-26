import { run } from '../../../../../run/services/tasks/release-production.js';
import { sinon, expect } from '../../../../test-helper.js';

describe('Unit | Run | Services | Tasks | Release production', function () {
  let dependencies;

  beforeEach(function () {
    dependencies = {
      github: {
        getLatestReleaseTag: sinon.stub().resolves('V1.0.0'),
        isBuildStatusOK: sinon.stub(),
      },
      _postMessage: sinon.stub(),
      getStatus: sinon.stub(),
      releasesService: {
        deploy: sinon.stub(),
        environments: {
          production: 'production',
        },
      },
    };
  });

  describe('run without errors', function () {
    it('should get tag, check status and deploy with a notification', async function () {
      // given
      dependencies.getStatus.resolves({ authorizeDeployment: true });
      dependencies.github.isBuildStatusOK.resolves(true);
      // when
      await run({ repository: 'my-repository', dependencies });

      // then
      expect(dependencies.github.getLatestReleaseTag).to.have.been.called;
      expect(dependencies.github.isBuildStatusOK).to.have.been.called;
      expect(dependencies.getStatus).to.have.been.calledWith({ repositoryName: 'pix' });
      expect(dependencies._postMessage).to.have.been.calledWith(
        `🚨 La mise en production de la V1.0.0 commence. Merci de surveiller son bon déroulement.`,
      );
      expect(dependencies.releasesService.deploy).to.have.been.calledWith('production', 'V1.0.0');
    });
  });

  describe('errors', function () {
    describe('status build is not ok', function () {
      it('should post a message with some informations', async function () {
        // given
        dependencies.github.isBuildStatusOK.resolves(false);

        // when
        await run({ repository: 'my-repository', dependencies });

        // then
        expect(dependencies.github.getLatestReleaseTag).to.have.been.called;
        expect(dependencies.github.isBuildStatusOK).to.have.been.called;
        expect(dependencies._postMessage).to.have.been.calledWith(
          "Impossible de lancer la mise en production. Veuillez consulter les logs pour plus d'informations",
        );
        expect(dependencies.getStatus).to.not.have.been.called;
        expect(dependencies.releasesService.deploy).to.not.have.been.called;
      });
    });

    describe('release production is blocked', function () {
      it('should post message for release blocked', async function () {
        // given
        dependencies.github.isBuildStatusOK.resolves(true);
        dependencies.getStatus.resolves({
          authorizeDeployment: false,
          blockReason: 'Maintenance',
        });

        // when
        await run({ repository: 'my-repository', dependencies });

        // then
        expect(dependencies.github.getLatestReleaseTag).to.have.been.called;
        expect(dependencies.github.isBuildStatusOK).to.have.been.called;
        expect(dependencies.getStatus).to.have.been.calledWith({ repositoryName: 'pix' });
        expect(dependencies._postMessage).to.have.been.calledWith(
          'Rappel: la Mise en production est bloquée. Motif: Maintenance',
        );
        expect(dependencies.releasesService.deploy).to.not.have.been.called;
      });
    });
  });
});
