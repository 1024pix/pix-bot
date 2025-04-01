import { deployReviewApps } from '../../../../build/services/deploy-review-apps.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Build | Services | deploy-review-apps', function () {
  describe('#deployReviewApps', function () {
    const retryAfter = Symbol('retryAfter');
    const transaction = Symbol('transaction');

    let scalingoClient;
    let ScalingoClient;
    let reviewAppRepository;
    let getRetryAfter;
    let knex;

    beforeEach(function () {
      scalingoClient = {
        deployUsingSCM: sinon.stub().resolves(),
      };
      ScalingoClient = {
        getInstance: sinon.stub().withArgs('reviewApps').resolves(scalingoClient),
      };
      reviewAppRepository = {
        getForDeployment: sinon.stub().resolves(undefined),
        markAsDeploying: sinon.stub().resolves(),
        scheduleDeployment: sinon.stub().resolves(),
      };
      getRetryAfter = sinon.stub().returns(retryAfter);
      knex = {
        async transaction(cb) {
          return cb(transaction);
        },
      };
    });

    it('should perform deployments until no more ready deployments', async function () {
      // given
      const application1 = { name: 'application1', deployScmRef: 'branch1' };
      const application2 = { name: 'application2', deployScmRef: 'branch2' };
      reviewAppRepository.getForDeployment.onFirstCall().resolves(application1);
      reviewAppRepository.getForDeployment.onSecondCall().resolves(application2);

      // when
      await deployReviewApps({ ScalingoClient, reviewAppRepository, getRetryAfter, knex });

      // then
      expect(reviewAppRepository.getForDeployment).to.have.been.calledThrice;

      expect(scalingoClient.deployUsingSCM).to.have.been.calledTwice;
      expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly(
        application1.name,
        application1.deployScmRef,
      );
      expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly(
        application2.name,
        application2.deployScmRef,
      );

      expect(reviewAppRepository.markAsDeploying).to.have.been.calledTwice;
      expect(reviewAppRepository.markAsDeploying).to.have.been.calledWithExactly(application1, transaction);
      expect(reviewAppRepository.markAsDeploying).to.have.been.calledWithExactly(application2, transaction);
    });

    describe('when a deployment fails', function () {
      it('should reschedule it and carry on like nothing happened', async function () {
        // given
        const application1 = { name: 'application1', deployScmRef: 'branch1' };
        const application2 = { name: 'application2', deployScmRef: 'branch2' };
        reviewAppRepository.getForDeployment.onFirstCall().resolves(application1);
        reviewAppRepository.getForDeployment.onSecondCall().resolves(application2);

        scalingoClient.deployUsingSCM.withArgs(application1.name, application1.deployScmRef).rejects(new Error());

        // when
        await deployReviewApps({ ScalingoClient, reviewAppRepository, getRetryAfter, knex });

        // then
        expect(reviewAppRepository.getForDeployment).to.have.been.calledThrice;

        expect(scalingoClient.deployUsingSCM).to.have.been.calledTwice;
        expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly(
          application1.name,
          application1.deployScmRef,
        );
        expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly(
          application2.name,
          application2.deployScmRef,
        );

        expect(reviewAppRepository.scheduleDeployment).to.have.been.calledOnceWithExactly({
          name: application1.name,
          deployScmRef: application1.deployScmRef,
          deployAfter: retryAfter,
        });

        expect(reviewAppRepository.markAsDeploying).to.have.been.calledOnceWithExactly(application2, transaction);
      });
    });
  });
});
