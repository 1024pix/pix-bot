import { expect, sinon } from '../../../test-helper.js';
import { mergeQueue } from '../../../../build/services/merge-queue.js';
import { config } from '../../../../config.js';

describe('Unit | Build | Services | merge-queue', function () {
  context('when there is PR in merging', function () {
    it('should do nothing', async function () {
      const repositoryName = Symbol('repository-name');
      const pullRequestRepository = {
        isAtLeastOneMergeInProgress: sinon.stub(),
      };
      pullRequestRepository.isAtLeastOneMergeInProgress.withArgs(repositoryName).resolves(true);

      await mergeQueue({ repositoryName, pullRequestRepository });

      expect(pullRequestRepository.isAtLeastOneMergeInProgress).to.have.been.called;
    });
  });

  context('when there is no PR in merging', function () {
    it('should get oldest pull requests, mark as currently merging and trigger auto-merge', async function () {
      const repositoryName = 'foo/pix-project';
      const pr = {
        number: 1,
        repositoryName,
        isMerging: false,
      };
      const pullRequestRepository = {
        isAtLeastOneMergeInProgress: sinon.stub(),
        getOldest: sinon.stub(),
        update: sinon.stub(),
      };
      pullRequestRepository.isAtLeastOneMergeInProgress.withArgs(repositoryName).resolves(false);
      pullRequestRepository.getOldest.withArgs(repositoryName).resolves(pr);

      const githubService = {
        triggerWorkflow: sinon.stub(),
      };

      await mergeQueue({ repositoryName, pullRequestRepository, githubService });

      expect(pullRequestRepository.isAtLeastOneMergeInProgress).to.have.been.called;
      expect(pullRequestRepository.update).to.have.been.calledWithExactly({
        number: 1,
        repositoryName: 'foo/pix-project',
        isMerging: true,
      });
      expect(githubService.triggerWorkflow).to.have.been.calledWithExactly({
        workflow: {
          id: config.github.automerge.workflowId,
          repositoryName: config.github.automerge.repositoryName,
          ref: config.github.automerge.workflowRef,
        },
        inputs: { pullRequest: 'foo/pix-project/1' },
      });
    });
  });
});
