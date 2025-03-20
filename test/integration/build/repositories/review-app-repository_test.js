import { describe } from 'mocha';
import { catchErr, expect } from '../../../test-helper.js';
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
      it('should update creation date and set as not deployed', async function () {
        // given
        const name = 'pix-api-review-pr123';
        const repository = 'pix';
        const prNumber = 123;
        const parentApp = 'pix-api-review';

        await reviewAppRepository.create({ name, repository, prNumber, parentApp });
        const initialReviewApp = await knex('review-apps').where({ name }).first();

        // when
        await reviewAppRepository.create({ name, repository, prNumber, parentApp });

        // then
        const mergedReviewApp = await knex('review-apps').where({ name }).first();
        expect(mergedReviewApp).not.to.be.null;
        expect(mergedReviewApp.name).to.equal(initialReviewApp.name);
        expect(mergedReviewApp.repository).to.equal(initialReviewApp.repository);
        expect(mergedReviewApp.prNumber).to.equal(initialReviewApp.prNumber);
        expect(mergedReviewApp.parentApp).to.equal(initialReviewApp.parentApp);
        expect(mergedReviewApp.isDeployed).to.be.false;
        expect(mergedReviewApp.createdAt).not.to.equal(initialReviewApp.createdAt);
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

    it('should return true when all applications but maddo are deployed', async function () {
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
      await reviewAppRepository.create({
        name: 'pix-api-maddo-review-pr123',
        repository,
        prNumber,
        parentApp: 'pix-api-maddo-review',
      });
      await reviewAppRepository.markAsFailed({ name: 'pix-api-maddo-review-pr123' });

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

  describe('#scheduleDeployment', function () {
    it('should update deployment columns', async function () {
      // given
      const application = {
        name: 'ma-super-appli',
        repository: 'monrepo',
        prNumber: 666,
        parentApp: 'maman',
      };
      const otherApplication = {
        name: 'mon-autre-appli',
        repository: 'monrepo',
        prNumber: 888,
        parentApp: 'maman',
      };
      await knex.insert([application, otherApplication]).into('review-apps');
      const deploymentParams = {
        name: application.name,
        deployScmRef: 'ma-vieille-branche',
        deployAfter: new Date('2025-01-14T14:29:14.416Z'),
      };

      // when
      await reviewAppRepository.scheduleDeployment(deploymentParams);

      // then
      const reviewApps = await knex.select('deployScmRef', 'deployAfter').from('review-apps').orderBy('name');
      expect(reviewApps).to.deep.equal([
        {
          deployScmRef: 'ma-vieille-branche',
          deployAfter: new Date('2025-01-14T14:29:14.416Z'),
        },
        {
          deployScmRef: null,
          deployAfter: null,
        },
      ]);
    });
  });

  describe('#markAsDeploying', function () {
    it('should empty deployAfter column', async function () {
      // given
      const application = {
        name: 'ma-super-appli',
        repository: 'monrepo',
        prNumber: 666,
        parentApp: 'maman',
        deployScmRef: 'branche1',
        deployAfter: new Date('2025-01-14T14:29:14.416Z'),
      };
      const otherApplication = {
        name: 'mon-autre-appli',
        repository: 'monrepo',
        prNumber: 888,
        parentApp: 'maman',
        deployScmRef: 'branche1',
        deployAfter: new Date('2025-01-14T14:29:14.416Z'),
      };
      await knex.insert([application, otherApplication]).into('review-apps');

      // when
      await reviewAppRepository.markAsDeploying({
        name: application.name,
      });

      // then
      const reviewApps = await knex.select('deployAfter').from('review-apps').orderBy('name');
      expect(reviewApps).to.deep.equal([
        {
          deployAfter: null,
        },
        {
          deployAfter: new Date('2025-01-14T14:29:14.416Z'),
        },
      ]);
    });
  });

  describe('#getForDeployment', () => {
    let readyTime1, readyTime2, notReadyTime;

    beforeEach(async function () {
      const now = new Date();
      readyTime1 = new Date(now.getTime() - 2000);
      readyTime2 = new Date(now.getTime() - 1000);
      notReadyTime = new Date(now.getTime() + 1000);

      await knex
        .insert({
          name: 'l-appli-de-mon-cousin',
          repository: 'monrepo',
          prNumber: 666,
          parentApp: 'maman',
          deployScmRef: 'un-rameau',
          deployAfter: notReadyTime,
        })
        .into('review-apps');
      await knex
        .insert({
          name: 'l-appli-de-ma-grand-mere',
          repository: 'monrepo',
          prNumber: 777,
          parentApp: 'maman',
          deployScmRef: 'une-souche',
          deployAfter: readyTime2,
        })
        .into('review-apps');
      await knex
        .insert({
          name: 'ma-super-appli',
          repository: 'monrepo',
          prNumber: 888,
          parentApp: 'maman',
          deployScmRef: 'ma-nouvelle-branche',
          deployAfter: readyTime1,
        })
        .into('review-apps');
    });

    it('should get the oldest ready deployment', async function () {
      // when
      const result = await reviewAppRepository.getForDeployment();

      // then
      expect(result).to.deep.contain({
        name: 'ma-super-appli',
        repository: 'monrepo',
        prNumber: 888,
        parentApp: 'maman',
        deployScmRef: 'ma-nouvelle-branche',
        deployAfter: readyTime1,
      });
    });
  });
});
