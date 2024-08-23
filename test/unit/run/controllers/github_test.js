import * as githubController from '../../../../run/controllers/github.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Run | Controller | Github', function () {
  describe('#processWebhook', function () {
    describe('when event is not handled', function () {
      it('should ignore the event', async function () {
        // given
        const request = {
          headers: {
            'x-github-event': 'unhandled-event',
          },
        };

        // when
        const result = await githubController.processWebhook(request);

        // then
        expect(result).to.equal('Ignoring unhandled-event event');
      });
    });

    describe('when event is handled', function () {
      describe('when event is release', function () {
        it(`should call releaseWebhook() method on released action`, async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'release',
            },
            payload: { action: 'released' },
          };

          const injectedReleaseWebhook = sinon.stub();

          // when
          await githubController.processWebhook(request, { injectedReleaseWebhook });

          // then
          expect(injectedReleaseWebhook.calledOnceWithExactly(request)).to.be.true;
        });

        it('should ignore the action', async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'release',
            },
            payload: { action: 'unhandled-action' },
          };

          // when
          const result = await githubController.processWebhook(request);

          // then
          expect(result).to.equal('Ignoring unhandled-action action');
        });
      });
    });
  });

  describe('#releaseWebhook', function () {
    context('when repo is handle', function () {
      it('should deploy release', async function () {
        // given
        const request = {
          payload: {
            action: 'released',
            release: {
              tag_name: 'v0.1.0',
            },
            repository: {
              organization: '1024pix',
              name: 'pix-repo-test',
            },
          },
        };
        const deployFromArchive = sinon.stub();
        const injectedConfigurationRepoAppMapping = {
          'pix-repo-test': ['pix-app-name-production', 'pix-app-name-2-production'],
        };
        const injectedScalingoClientStub = {
          getInstance: () => ({
            deployFromArchive,
          }),
        };

        // when
        await githubController.releaseWebhook(request, injectedConfigurationRepoAppMapping, injectedScalingoClientStub);

        // then
        expect(deployFromArchive.firstCall).to.be.calledWith('pix-app-name-production', 'v0.1.0', 'pix-repo-test', {
          withEnvSuffix: false,
        });
        expect(deployFromArchive.secondCall).to.be.calledWith('pix-app-name-2-production', 'v0.1.0', 'pix-repo-test', {
          withEnvSuffix: false,
        });
      });
    });

    context('when repo is not handle', function () {
      it('should not try to deploy release', async function () {
        // given
        const request = {
          payload: {
            action: 'released',
            release: {
              tag_name: 'v0.1.0',
            },
            repository: {
              organization: '1024pix',
              name: 'pix-repo-test',
            },
          },
        };
        const deployUsingSCMStub = sinon.stub();
        const injectedConfigurationRepoAppMapping = {};
        const injectedScalingoClientStub = {
          getInstance: () => ({
            deployUsingSCM: deployUsingSCMStub,
          }),
        };

        // when
        const result = await githubController.releaseWebhook(
          request,
          injectedConfigurationRepoAppMapping,
          injectedScalingoClientStub,
        );

        // then
        expect(deployUsingSCMStub).to.have.not.been.called;
        expect(result).to.equal('No Scalingo app configured for this repository');
      });
    });
  });
});
