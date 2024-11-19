import { expect, sinon } from '../../../test-helper.js';
import * as reviewAppDeployment from '../../../../build/services/review-app-deployment.js';
import { knex } from '../../../../db/knex-database-connection.js';

describe('Unit | Build | Service | review-app-deployment', function () {
  describe('#deploy', function () {
    const transaction = Symbol('transaction');
    let reviewAppDeploymentRepository, scalingoClient;

    beforeEach(function () {
      sinon.stub(knex, 'transaction').callsFake(async (callback) => callback(transaction));

      reviewAppDeploymentRepository = {
        listForDeployment: sinon.stub(),
        remove: sinon.stub(),
      };

      scalingoClient = {
        reviewAppExists: sinon.stub(),
        deployUsingSCM: sinon.stub(),
      };
    });

    it('should send ready deployments to Scalingo', async function () {
      // given
      const deployments = [
        { appName: 'ma-super-appli', scmRef: 'un-rameau' },
        { appName: 'l-appli-de-ma-meme', scmRef: 'une-souche' },
      ];
      reviewAppDeploymentRepository.listForDeployment.withArgs(transaction).resolves(deployments);
      scalingoClient.reviewAppExists.withArgs('ma-super-appli').resolves(true);
      scalingoClient.reviewAppExists.withArgs('l-appli-de-ma-meme').resolves(true);
      scalingoClient.deployUsingSCM.resolves();
      reviewAppDeploymentRepository.remove.resolves();

      // when
      await reviewAppDeployment.deploy({ reviewAppDeploymentRepository, scalingoClient, started: true });

      // then
      expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly('ma-super-appli', 'un-rameau');
      expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly('l-appli-de-ma-meme', 'une-souche');
      expect(reviewAppDeploymentRepository.remove).to.have.been.calledWithExactly('ma-super-appli', transaction);
      expect(reviewAppDeploymentRepository.remove).to.have.been.calledWithExactly('l-appli-de-ma-meme', transaction);
    });

    describe('when an app doesn’t exist anymore', function () {
      it('should skip deployment', async function () {
        // given
        const deployments = [
          { appName: 'ma-super-appli', scmRef: 'un-rameau' },
          { appName: 'l-appli-de-ma-meme', scmRef: 'une-souche' },
        ];
        reviewAppDeploymentRepository.listForDeployment.withArgs(transaction).resolves(deployments);
        scalingoClient.reviewAppExists.withArgs('ma-super-appli').resolves(true);
        scalingoClient.reviewAppExists.withArgs('l-appli-de-ma-meme').resolves(false);
        scalingoClient.deployUsingSCM.resolves();
        reviewAppDeploymentRepository.remove.resolves();

        // when
        await reviewAppDeployment.deploy({ reviewAppDeploymentRepository, scalingoClient, started: true });

        // then
        expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly('ma-super-appli', 'un-rameau');
        expect(scalingoClient.deployUsingSCM).not.to.have.been.calledWithExactly('l-appli-de-ma-meme', 'une-souche');
        expect(reviewAppDeploymentRepository.remove).to.have.been.calledWithExactly('ma-super-appli', transaction);
        expect(reviewAppDeploymentRepository.remove).to.have.been.calledWithExactly('l-appli-de-ma-meme', transaction);
      });
    });

    describe('when an error occurs for a deployment', function () {
      it('should perform other deployments', async function () {
        // given
        const deployments = [
          { appName: 'ma-super-appli', scmRef: 'un-rameau' },
          { appName: 'l-appli-de-ma-meme', scmRef: 'une-souche' },
        ];
        reviewAppDeploymentRepository.listForDeployment.withArgs(transaction).resolves(deployments);
        scalingoClient.reviewAppExists.withArgs('ma-super-appli').resolves(true);
        scalingoClient.reviewAppExists.withArgs('l-appli-de-ma-meme').resolves(true);
        scalingoClient.deployUsingSCM.resolves();
        scalingoClient.deployUsingSCM.withArgs('ma-super-appli', 'un-rameau').rejects();
        reviewAppDeploymentRepository.remove.resolves();

        // when
        await reviewAppDeployment.deploy({ reviewAppDeploymentRepository, scalingoClient, started: true });

        // then
        expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly('ma-super-appli', 'un-rameau');
        expect(scalingoClient.deployUsingSCM).to.have.been.calledWithExactly('l-appli-de-ma-meme', 'une-souche');
        expect(reviewAppDeploymentRepository.remove).to.have.been.calledWithExactly('l-appli-de-ma-meme', transaction);
      });
    });

    describe('when started is false', function () {
      it('should not perform deployments', async function () {
        // given
        const deployments = [
          { appName: 'ma-super-appli', scmRef: 'un-rameau' },
          { appName: 'l-appli-de-ma-meme', scmRef: 'une-souche' },
        ];
        reviewAppDeploymentRepository.listForDeployment.withArgs(transaction).resolves(deployments);

        // when
        await reviewAppDeployment.deploy({ reviewAppDeploymentRepository, scalingoClient, started: false });

        // then
        expect(scalingoClient.reviewAppExists).not.to.have.been.called;
        expect(scalingoClient.deployUsingSCM).not.to.have.been.called;
        expect(reviewAppDeploymentRepository.remove).not.to.have.been.called;
      });
    });
  });
});
