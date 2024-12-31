import { expect, sinon } from '../../../test-helper.js';
import { MergeQueue } from '../../../../build/services/merge-queue.js';
import { config } from '../../../../config.js';

describe('Unit | Build | Services | merge-queue', function () {
  describe('#manage', function () {
    context('when there is PR in merging', function () {
      it('should do nothing', async function () {
        const repositoryName = Symbol('repository-name');
        const pullRequestRepository = {
          isAtLeastOneMergeInProgress: sinon.stub(),
        };
        pullRequestRepository.isAtLeastOneMergeInProgress.withArgs(repositoryName).resolves(true);

        await new MergeQueue({ pullRequestRepository }).manage({ repositoryName });

        expect(pullRequestRepository.isAtLeastOneMergeInProgress).to.have.been.called;
      });
    });

    context('when there is no PR in merging', function () {
      it('should find not merged pull requests, mark latest as currently merging and trigger auto-merge', async function () {
        const repositoryName = 'foo/pix-project';
        const pr = {
          number: 1,
          repositoryName,
          isMerging: false,
        };
        const pullRequestRepository = {
          isAtLeastOneMergeInProgress: sinon.stub(),
          findNotMerged: sinon.stub(),
          update: sinon.stub(),
        };
        pullRequestRepository.isAtLeastOneMergeInProgress.withArgs(repositoryName).resolves(false);
        pullRequestRepository.findNotMerged.withArgs(repositoryName).resolves([pr]);

        const githubService = {
          triggerWorkflow: sinon.stub(),
          setMergeQueueStatus: sinon.stub(),
        };

        await new MergeQueue({ pullRequestRepository, githubService }).manage({ repositoryName });

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

      it('should create commit status for each pending pull request', async function () {
        const repositoryName = 'foo/pix-project';
        const prs = [
          {
            number: 1,
            repositoryName,
            isMerging: false,
          },
          {
            number: 2,
            repositoryName,
            isMerging: false,
          },
        ];
        const pullRequestRepository = {
          isAtLeastOneMergeInProgress: sinon.stub(),
          findNotMerged: sinon.stub(),
          update: sinon.stub(),
        };
        pullRequestRepository.isAtLeastOneMergeInProgress.withArgs(repositoryName).resolves(false);
        pullRequestRepository.findNotMerged.withArgs(repositoryName).resolves(prs);

        const githubService = {
          triggerWorkflow: sinon.stub(),
          setMergeQueueStatus: sinon.stub(),
        };

        await new MergeQueue({ pullRequestRepository, githubService }).manage({ repositoryName });

        expect(githubService.setMergeQueueStatus).to.have.been.calledTwice;
        expect(githubService.setMergeQueueStatus.firstCall).to.have.been.calledWithExactly({
          status: 'pending',
          description: 'En cours de merge',
          repositoryFullName: repositoryName,
          prNumber: 1,
        });
        expect(githubService.setMergeQueueStatus.secondCall).to.have.been.calledWithExactly({
          status: 'pending',
          description: "2/2 dans la file d'attente",
          repositoryFullName: repositoryName,
          prNumber: 2,
        });
      });
    });
  });

  describe('#managePullRequest', function () {
    it('should save pr and call manage method', async function () {
      const repositoryName = Symbol('repository-name');
      const pullRequestNumber = Symbol('pull-request-number');

      const pullRequestRepository = {
        save: sinon.stub(),
      };

      const mergeQueue = new MergeQueue({ pullRequestRepository });
      mergeQueue.manage = sinon.stub();

      await mergeQueue.managePullRequest({ repositoryName, number: pullRequestNumber });

      expect(pullRequestRepository.save).to.have.been.calledOnceWithExactly({
        repositoryName,
        number: pullRequestNumber,
      });
      expect(mergeQueue.manage).to.have.been.calledOnceWithExactly({ repositoryName });
    });
  });

  describe('#unmanagePullRequest', function () {
    it('should remove pr and call manage method', async function () {
      const repositoryName = Symbol('repository-name');
      const pullRequestNumber = Symbol('pull-request-number');

      const pullRequestRepository = {
        remove: sinon.stub(),
      };

      const mergeQueue = new MergeQueue({ pullRequestRepository });
      mergeQueue.manage = sinon.stub();

      await mergeQueue.unmanagePullRequest({ repositoryName, number: pullRequestNumber });

      expect(pullRequestRepository.remove).to.have.been.calledOnceWithExactly({
        repositoryName,
        number: pullRequestNumber,
      });
      expect(mergeQueue.manage).to.have.been.calledOnceWithExactly({ repositoryName });
    });
  });
});
