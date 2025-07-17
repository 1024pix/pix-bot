import { expect, sinon } from '../../../test-helper.js';
import { MERGE_STATUS, MergeQueue } from '../../../../build/services/merge-queue.js';
import { PullRequestNotFoundError } from '../../../../build/repositories/pull-request-repository.js';
import { describe } from 'mocha';

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

        const pullRequestMergeService = {
          merge: sinon.stub(),
          areMergeConditionsMet: sinon.stub(),
        };

        await new MergeQueue({ pullRequestRepository, pullRequestMergeService }).manage({ repositoryName });

        expect(pullRequestRepository.isAtLeastOneMergeInProgress).to.have.been.called;
        expect(pullRequestRepository.update).to.have.been.calledWithExactly({
          number: 1,
          repositoryName: 'foo/pix-project',
          isMerging: true,
        });
        expect(pullRequestMergeService.areMergeConditionsMet).to.have.been.calledWithExactly({
          number: 1,
          repositoryName: 'foo/pix-project',
        });
        expect(pullRequestMergeService.merge).to.have.been.calledWithExactly({
          number: 1,
          repositoryName: 'foo/pix-project',
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
    describe('when pr is not managed', function () {
      it('should do nothing', async function () {
        const repositoryName = Symbol('repository-name');
        const pullRequestNumber = Symbol('pull-request-number');

        const pullRequestRepository = {
          remove: sinon.stub(),
          get: sinon.stub(),
        };
        const mergeService = {
          unmanage: sinon.stub(),
        };

        const mergeQueue = new MergeQueue({ pullRequestRepository, pullRequestMergeService: mergeService });
        mergeQueue.manage = sinon.stub();

        pullRequestRepository.get.withArgs({ repositoryName, number: pullRequestNumber }).resolves(null);

        await mergeQueue.unmanagePullRequest({ repositoryName, number: pullRequestNumber, status: MERGE_STATUS.ERROR });

        expect(pullRequestRepository.remove).to.have.not.been.called;
        expect(mergeService.unmanage).to.have.not.been.called;
        expect(mergeQueue.manage).to.have.not.been.called;
      });
    });

    describe('when pr is managed', function () {
      it('should remove pr and call manage method', async function () {
        const repositoryName = Symbol('repository-name');
        const pullRequestNumber = Symbol('pull-request-number');

        const pullRequestRepository = {
          remove: sinon.stub(),
          get: sinon.stub(),
        };
        const mergeService = {
          unmanage: sinon.stub(),
        };

        const mergeQueue = new MergeQueue({ pullRequestRepository, pullRequestMergeService: mergeService });
        mergeQueue.manage = sinon.stub();

        pullRequestRepository.get
          .withArgs({ repositoryName, number: pullRequestNumber })
          .resolves({ repositoryName, number: pullRequestNumber });

        await mergeQueue.unmanagePullRequest({ repositoryName, number: pullRequestNumber, status: MERGE_STATUS.ERROR });

        expect(pullRequestRepository.remove).to.have.been.calledOnceWithExactly({
          repositoryName,
          number: pullRequestNumber,
        });
        expect(mergeQueue.manage).to.have.been.calledOnceWithExactly({ repositoryName });
        expect(mergeService.unmanage).to.have.been.calledOnceWithExactly({
          repositoryName,
          number: pullRequestNumber,
          status: MERGE_STATUS.ERROR,
        });
      });
    });
  });

  describe('#pullRequestIsManaged', function () {
    it('should return true when pr is managed', async function () {
      const repositoryName = Symbol('repository-name');
      const number = Symbol('pull-request-number');

      const pullRequestRepository = {
        get: sinon.stub(),
      };
      pullRequestRepository.get.resolves();

      const mergeQueue = new MergeQueue({ pullRequestRepository });

      const result = await mergeQueue.pullRequestIsManaged({ repositoryName, number });

      expect(result).to.be.true;
    });

    it('should return false when pr is not managed', async function () {
      const repositoryName = Symbol('repository-name');
      const number = Symbol('pull-request-number');

      const pullRequestRepository = {
        get: sinon.stub(),
      };
      pullRequestRepository.get.throws(new PullRequestNotFoundError());

      const mergeQueue = new MergeQueue({ pullRequestRepository });

      const result = await mergeQueue.pullRequestIsManaged({ repositoryName, number });

      expect(result).to.be.false;
    });
  });
});
