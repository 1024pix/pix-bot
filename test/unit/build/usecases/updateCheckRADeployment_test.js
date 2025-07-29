import { updateCheckRADeployment } from '../../../../build/usecases/updateCheckRADeployment.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Usecases | #updateCheckRADeployment', function () {
  describe('when at least one app is failing', function () {
    it('updates check-ra-deployment’s status to failure', async function () {
      // given
      const repositoryName = 'pix';
      const pullRequestNumber = 123;
      const sha = 'abc123';
      const reviewAppRepo = {
        listForPullRequest: sinon
          .stub()
          .resolves([{ status: 'success' }, { status: 'pending' }, { status: 'success' }, { status: 'failure' }]),
      };
      const githubService = {
        addRADeploymentCheck: sinon.stub().resolves(),
      };

      // when
      await updateCheckRADeployment({ repositoryName, pullRequestNumber, sha }, { reviewAppRepo, githubService });

      // then
      expect(githubService.addRADeploymentCheck).to.have.been.calledOnceWithExactly({
        repository: repositoryName,
        prNumber: pullRequestNumber,
        status: 'failure',
        sha,
      });
    });
  });

  describe('when no app is failing and at least one app is pending', function () {
    it('updates check-ra-deployment’s status to pending', async function () {
      // given
      const repositoryName = 'pix';
      const pullRequestNumber = 123;
      const sha = 'abc123';
      const reviewAppRepo = {
        listForPullRequest: sinon
          .stub()
          .resolves([{ status: 'success' }, { status: 'pending' }, { status: 'success' }, { status: 'success' }]),
      };
      const githubService = {
        addRADeploymentCheck: sinon.stub().resolves(),
      };

      // when
      await updateCheckRADeployment({ repositoryName, pullRequestNumber, sha }, { reviewAppRepo, githubService });

      // then
      expect(githubService.addRADeploymentCheck).to.have.been.calledOnceWithExactly({
        repository: repositoryName,
        prNumber: pullRequestNumber,
        status: 'pending',
        sha,
      });
    });
  });

  describe('when all apps are in success', function () {
    it('updates check-ra-deployment’s status to success', async function () {
      // given
      const repositoryName = 'pix';
      const pullRequestNumber = 123;
      const sha = 'abc123';
      const reviewAppRepo = {
        listForPullRequest: sinon
          .stub()
          .resolves([{ status: 'success' }, { status: 'success' }, { status: 'success' }, { status: 'success' }]),
      };
      const githubService = {
        addRADeploymentCheck: sinon.stub().resolves(),
      };

      // when
      await updateCheckRADeployment({ repositoryName, pullRequestNumber, sha }, { reviewAppRepo, githubService });

      // then
      expect(githubService.addRADeploymentCheck).to.have.been.calledOnceWithExactly({
        repository: repositoryName,
        prNumber: pullRequestNumber,
        status: 'success',
        sha,
      });
    });
  });
});
