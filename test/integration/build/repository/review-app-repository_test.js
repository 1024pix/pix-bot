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
});
