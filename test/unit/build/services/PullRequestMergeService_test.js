import { sinon, expect } from '../../../test-helper.js';
import { PullRequestMergeService } from '../../../../build/services/PullRequestMergeService.js';
import Promise from 'lodash/_Promise.js';

describe('Unit | Build | Models | PullRequestMergeService', function () {
  let githubService;
  let mergeService;

  beforeEach(function () {
    githubService = {
      updatePullRequestBranch: sinon.stub(),
      enableAutoMerge: sinon.stub(),
      setMergeQueueStatus: sinon.stub(),
      getPullRequestDetails: sinon.stub(),
      isMergeable: sinon.stub(),
    };
    mergeService = new PullRequestMergeService({ githubService });
  });

  describe('#areMergeConditionsMet', function () {
    context('when conditions are met', function () {
      it('should get details of pr and verify labels conditions', async function () {
        // given
        const pr = { number: 123, repositoryName: '1024pix/pix-test' };
        const prDetails = {
          labels: [':rocket: Ready to Merge'],
        };
        githubService.getPullRequestDetails
          .withArgs({
            number: pr.number,
            repositoryName: pr.repositoryName,
          })
          .resolves(prDetails);
        githubService.isMergeable.resolves(true);

        // when
        const result = await mergeService.areMergeConditionsMet({ number: 123, repositoryName: '1024pix/pix-test' });

        // then
        expect(result).to.be.true;
      });
    });

    context('when conditions are not met', function () {
      context('when blocking label is present', function () {
        it('should return false', async function () {
          // given
          const pr = { number: 123, repositoryName: '1024pix/pix-test' };
          const prDetails = {
            labels: ['Development in progress'],
          };
          githubService.getPullRequestDetails
            .withArgs({
              number: pr.number,
              repositoryName: pr.repositoryName,
            })
            .resolves(prDetails);

          // when
          const result = await mergeService.areMergeConditionsMet({ number: 123, repositoryName: '1024pix/pix-test' });

          // then
          expect(result).to.be.false;
        });
      });

      context('when merge label is not present', function () {
        it('should return false', async function () {
          // given
          const pr = { number: 123, repositoryName: '1024pix/pix-test' };
          const prDetails = {
            labels: [],
          };
          githubService.getPullRequestDetails
            .withArgs({
              number: pr.number,
              repositoryName: pr.repositoryName,
            })
            .resolves(prDetails);

          // when
          const result = await mergeService.areMergeConditionsMet({ number: 123, repositoryName: '1024pix/pix-test' });

          // then
          expect(result).to.be.false;
        });
      });
    });
  });

  describe('#merge', function () {
    it('should update branch, enable auto merge, and update github commit status', async function () {
      // when
      await mergeService.merge({ number: 123, repositoryName: '1024pix/pix-test' });

      // then
      expect(githubService.updatePullRequestBranch).to.have.been.calledWithExactly({
        number: 123,
        repositoryName: '1024pix/pix-test',
      });
      expect(githubService.enableAutoMerge).to.have.been.calledWithExactly({
        number: 123,
        repositoryName: '1024pix/pix-test',
      });
      expect(githubService.setMergeQueueStatus).to.have.been.calledWithExactly({
        prNumber: 123,
        repositoryFullName: '1024pix/pix-test',
        status: 'pending',
        description: 'En cours de merge',
      });
    });

    context('when update commit status failed', function () {
      it('should continue', async function () {
        // when
        await mergeService.merge({ number: 123, repositoryName: '1024pix/pix-test' });

        // then
        expect(githubService.updatePullRequestBranch).to.have.been.calledWithExactly({
          number: 123,
          repositoryName: '1024pix/pix-test',
        });
        expect(githubService.enableAutoMerge).to.have.been.calledWithExactly({
          number: 123,
          repositoryName: '1024pix/pix-test',
        });
        expect(githubService.setMergeQueueStatus).to.have.been.calledWithExactly({
          prNumber: 123,
          repositoryFullName: '1024pix/pix-test',
          status: 'pending',
          description: 'En cours de merge',
        });
      });
    });
  });

  describe('#updateMergeQueuePosition', function () {
    it('should call update github commit status', async function () {
      // when
      await mergeService.updateMergeQueuePosition({
        number: 123,
        repositoryName: '1024pix/pix-test',
        position: 2,
        total: 10,
      });

      // then
      expect(githubService.setMergeQueueStatus).to.have.been.calledWithExactly({
        prNumber: 123,
        repositoryFullName: '1024pix/pix-test',
        status: 'pending',
        description: "2/10 dans la file d'attente",
      });
    });
  });
});
