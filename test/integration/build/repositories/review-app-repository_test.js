import { expect } from '../../../test-helper.js';
import * as reviewAppRepository from '../../../../build/repositories/review-app-repository.js';
import { knex } from '../../../../db/knex-database-connection.js';

describe('Integration | Build | Repository | Review App', function () {
  afterEach(async function () {
    await knex('review-apps').truncate();
  });

  describe('create', function () {
    it('should insert a review app', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';
      const deploymentId = 'deployment-id-123';

      // when
      await reviewAppRepository.create({ name, repository, prNumber, parentApp, deploymentId });

      // then
      const reviewApp = await knex('review-apps').where({ name }).first();

      expect(reviewApp).not.to.be.null;
      expect(reviewApp).to.have.property('name', name);
      expect(reviewApp).to.have.property('repository', repository);
      expect(reviewApp).to.have.property('prNumber', prNumber);
      expect(reviewApp).to.have.property('parentApp', parentApp);
      expect(reviewApp).to.have.property('status', 'pending');
      expect(reviewApp).to.have.property('lastDeploymentId', deploymentId);
    });

    describe('when a review app already exists', function () {
      it('should update creation date and set as not deployed', async function () {
        // given
        const name = 'pix-api-review-pr123';
        const repository = 'pix';
        const prNumber = 123;
        const parentApp = 'pix-api-review';
        const deploymentId = 'deployment-id-456';

        const [initialReviewApp] = await knex('review-apps')
          .insert({
            name,
            repository,
            prNumber,
            parentApp,
            status: 'success',
            lastDeploymentId: 'deployment-id-123',
          })
          .returning('*');

        // when
        await reviewAppRepository.create({ name, repository, prNumber, parentApp, deploymentId });

        // then
        const mergedReviewApp = await knex('review-apps').where({ name }).first();
        expect(mergedReviewApp).not.to.be.null;
        expect(mergedReviewApp).to.have.property('name', initialReviewApp.name);
        expect(mergedReviewApp).to.have.property('repository', initialReviewApp.repository);
        expect(mergedReviewApp).to.have.property('prNumber', initialReviewApp.prNumber);
        expect(mergedReviewApp).to.have.property('parentApp', initialReviewApp.parentApp);
        expect(mergedReviewApp).to.have.property('status', 'pending');
        expect(mergedReviewApp).to.have.property('lastDeploymentId', deploymentId);
        expect(mergedReviewApp).to.have.property('createdAt').that.does.not.equal(initialReviewApp.createdAt);
      });
    });
  });

  describe('get', function () {
    it('returns review app information', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';
      const status = 'pending';
      const lastDeploymentId = 'deployment-id-123';

      await knex('review-apps').insert({
        name,
        repository,
        prNumber,
        parentApp,
        status,
        lastDeploymentId,
      });

      // when
      const reviewApp = await reviewAppRepository.get(name);

      expect(reviewApp).to.deep.equal({
        name,
        repository,
        prNumber,
        status,
        lastDeploymentId,
      });
    });
  });

  describe('setStatusPending', function () {
    it('sets status to pending and lastDeploymentId to given value', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';
      const deploymentId = 'deployment-id-123';

      await knex('review-apps').insert({
        name,
        repository,
        prNumber,
        parentApp,
        status: 'success',
        lastDeploymentId: null,
      });

      // when
      await reviewAppRepository.setStatusPending({ name, deploymentId });

      // then
      const updatedReviewApp = await knex('review-apps').where({ name }).first();
      expect(updatedReviewApp).to.have.property('status', 'pending');
      expect(updatedReviewApp).to.have.property('lastDeploymentId', deploymentId);
    });

    describe('when review app does not exist', function () {
      it('does nothing', async function () {
        // given
        const name = 'does-not-exist';
        const deploymentId = 'deployment-id-123';

        // when
        await reviewAppRepository.setStatusPending({ name, deploymentId });

        // then
      });
    });
  });

  describe('setStatusSettled', function () {
    it('sets status and return repository and prNumber', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';
      const status = 'success';

      await knex('review-apps').insert({
        name,
        repository,
        prNumber,
        parentApp,
        status: 'pending',
        lastDeploymentId: 'deployment-id-123',
      });

      // when
      await reviewAppRepository.setStatusSettled({ name, status });

      const updatedReviewApp = await knex('review-apps').where({ name }).first();
      expect(updatedReviewApp).to.have.property('status', 'success');
      expect(updatedReviewApp).to.have.property('lastDeploymentId', null);
    });

    describe('when review app does not exist', function () {
      it('returns undefined', async function () {
        // given
        const name = 'does-not-exist';
        const status = 'success';

        // when
        await reviewAppRepository.setStatusSettled({ name, status });

        // then
      });
    });
  });

  describe('remove', function () {
    it('it should remove the review app', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';

      await reviewAppRepository.create({ name, repository, prNumber, parentApp });

      // when
      const result = await reviewAppRepository.remove({ name });

      // then
      expect(result).to.equal(1);
      const removedReviewApp = await knex('review-apps').where({ name }).first();
      expect(removedReviewApp).to.be.undefined;
    });

    describe('when the review-app does not exist', function () {
      it('it should not throw an exception', async function () {
        // given
        const name = 'unknown-review-app';

        // when
        const result = await reviewAppRepository.remove({ name });

        // then
        expect(result).to.equal(0);
      });
    });
  });

  describe('listForPullRequest', function () {
    it('returns parent app name for a pull request', async function () {
      // given
      const repository = 'pix';
      const prNumber = 123;

      await knex('review-apps').insert({
        repository,
        prNumber,
        parentApp: 'pix-certif-review',
        name: 'pix-certif-review-pr123',
        status: 'pending',
      });
      await knex('review-apps').insert({
        repository,
        prNumber,
        parentApp: 'pix-api-review',
        name: 'pix-api-review-pr123',
        status: 'failure',
      });
      await knex('review-apps').insert({
        repository,
        prNumber: 456,
        parentApp: 'pix-certif-review',
        name: 'pix-certif-review-pr456',
      });
      await knex('review-apps').insert({
        repository: 'pix-epreuves',
        prNumber,
        parentApp: 'pix-epreuves-review',
        name: 'pix-epreuves-review-pr123',
      });

      // when
      const reviewApps = await reviewAppRepository.listForPullRequest({ repository, prNumber });

      // then
      expect(reviewApps).to.deep.equal([
        { name: 'pix-api-review-pr123', parentApp: 'pix-api-review', status: 'failure' },
        { name: 'pix-certif-review-pr123', parentApp: 'pix-certif-review', status: 'pending' },
      ]);
    });
  });
});
