import { describe } from 'mocha';
import { catchErr, expect } from '../../../test-helper.js';
import * as reviewAppRepository from '../../../../build/repository/review-app-repository.js';
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

      // when
      await reviewAppRepository.create({ name, repository, prNumber, parentApp });

      // then
      const reviewApp = await knex('review-apps').where({ name }).first();

      expect(reviewApp).not.to.be.null;
      expect(reviewApp.name).to.equal(name);
      expect(reviewApp.repository).to.equal(repository);
      expect(reviewApp.prNumber).to.equal(prNumber);
      expect(reviewApp.parentApp).to.equal(parentApp);
      expect(reviewApp.isDeployed).to.be.false;
    });

    describe('when a review app already exists', function () {
      it('should throw an error', async function () {
        // given
        const name = 'pix-api-review-pr123';
        const repository = 'pix';
        const prNumber = 123;
        const parentApp = 'pix-api-review';

        await reviewAppRepository.create({ name, repository, prNumber, parentApp });

        // when
        const error = await catchErr(reviewAppRepository.create)({ name, repository, prNumber, parentApp });

        // then
        expect(error.detail).to.equal('Key (name)=(pix-api-review-pr123) already exists.');
      });
    });
  });

  describe('markAsDeployed', function () {
    it('should set isDeployed to true and return repository and prNumber', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';

      await reviewAppRepository.create({ name, repository, prNumber, parentApp });

      // when
      const result = await reviewAppRepository.markAsDeployed({ name });

      const updatedReviewApp = await knex('review-apps').where({ name }).first();
      expect(updatedReviewApp.isDeployed).to.be.true;
      expect(result.repository).to.equal(repository);
      expect(result.prNumber).to.equal(prNumber);
    });

    describe('when review app does not exist', function () {
      it('should throw an Error', async function () {
        // when
        const name = 'does-not-exist';
        const error = await catchErr(reviewAppRepository.markAsDeployed)({ name });

        expect(error.message).to.equal(`${name} doesn't exist.`);
      });
    });
  });

  describe('markAsFailed', function () {
    it('should set isDeployed to false and return repository and prNumber', async function () {
      // given
      const name = 'pix-api-review-pr123';
      const repository = 'pix';
      const prNumber = 123;
      const parentApp = 'pix-api-review';

      await reviewAppRepository.create({ name, repository, prNumber, parentApp });
      await reviewAppRepository.markAsDeployed({ name });

      // when
      const result = await reviewAppRepository.markAsFailed({ name });

      const updatedReviewApp = await knex('review-apps').where({ name }).first();
      expect(updatedReviewApp.isDeployed).to.be.false;
      expect(result.repository).to.equal(repository);
      expect(result.prNumber).to.equal(prNumber);
    });

    describe('when review app does not exist', function () {
      it('should throw an Error', async function () {
        // when
        const name = 'does-not-exist';
        const error = await catchErr(reviewAppRepository.markAsFailed)({ name });

        expect(error.message).to.equal(`${name} doesn't exist.`);
      });
    });
  });

  describe('areAllDeployed', function () {
    it('should return true when all applications are deployed', async function () {
      // given
      const repository = 'pix';
      const prNumber = 123;

      await reviewAppRepository.create({
        name: 'other-repo-review-pr1',
        repository: 'other-repo',
        prNumber: 1,
        parentApp: 'other-repo-review',
      });
      await reviewAppRepository.create({
        name: 'pix-api-review-pr123',
        repository,
        prNumber,
        parentApp: 'pix-api-review',
      });
      await reviewAppRepository.markAsDeployed({ name: 'pix-api-review-pr123' });
      await reviewAppRepository.create({
        name: 'pix-front-review-pr123',
        repository,
        prNumber,
        parentApp: 'pix-front-review',
      });
      await reviewAppRepository.markAsDeployed({ name: 'pix-front-review-pr123' });

      // when
      const areAllDeployed = await reviewAppRepository.areAllDeployed({ repository, prNumber });

      expect(areAllDeployed).to.be.true;
    });

    it('should return false when not all applications are deployed', async function () {
      // given
      const repository = 'pix';
      const prNumber = 123;

      await reviewAppRepository.create({
        name: 'other-repo-review-pr1',
        repository: 'other-repo',
        prNumber: 1,
        parentApp: 'other-repo-review',
      });
      await reviewAppRepository.create({
        name: 'pix-api-review-pr123',
        repository,
        prNumber,
        parentApp: 'pix-api-review',
      });
      await reviewAppRepository.markAsDeployed({ name: 'pix-api-review-pr123' });
      await reviewAppRepository.create({
        name: 'pix-front-review-pr123',
        repository,
        prNumber,
        parentApp: 'pix-front-review',
      });

      // when
      const areAllDeployed = await reviewAppRepository.areAllDeployed({ repository, prNumber });

      expect(areAllDeployed).to.be.false;
    });
  });
});
