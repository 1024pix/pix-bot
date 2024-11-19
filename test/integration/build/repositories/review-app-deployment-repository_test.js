import { describe } from 'mocha';
import { expect } from '../../../test-helper.js';
import * as reviewAppDeploymentRepository from '../../../../build/repositories/review-app-deployment-repository.js';
import { knex } from '../../../../db/knex-database-connection.js';

const TABLE_NAME = 'review-apps-deployments';

describe('Integration | Build | Repository | Review App Deployment', function () {
  afterEach(async function () {
    await knex(TABLE_NAME).truncate();
  });

  describe('#save', function () {
    it('should insert a deployment', async function () {
      // given
      const deployment = {
        appName: 'ma-super-appli',
        scmRef: 'ma-vieille-branche',
        after: new Date('2025-01-14T14:29:14.416Z'),
      };

      // when
      await reviewAppDeploymentRepository.save(deployment);

      // then
      const reviewAppDeployments = await knex.select().from(TABLE_NAME);

      expect(reviewAppDeployments).to.deep.equal([
        {
          appName: 'ma-super-appli',
          scmRef: 'ma-vieille-branche',
          after: new Date('2025-01-14T14:29:14.416Z'),
        },
      ]);
    });

    describe('when deployments exist for other apps', () => {
      it('should insert a deployment', async function () {
        // given
        await knex
          .insert({
            appName: 'l-appli-de-mon-cousin',
            scmRef: 'un-rameau',
            after: new Date('2015-01-14T14:29:14.416Z'),
          })
          .into(TABLE_NAME);
        await knex
          .insert({
            appName: 'l-appli-de-ma-grand-mere',
            scmRef: 'une-souche',
            after: new Date('1925-01-14T14:29:14.416Z'),
          })
          .into(TABLE_NAME);

        const deployment = {
          appName: 'ma-super-appli',
          scmRef: 'ma-vieille-branche',
          after: new Date('2025-01-14T14:29:14.416Z'),
        };

        // when
        await reviewAppDeploymentRepository.save(deployment);

        // then
        const reviewAppDeployments = await knex.select().from(TABLE_NAME).orderBy('after');

        expect(reviewAppDeployments).to.deep.equal([
          {
            appName: 'l-appli-de-ma-grand-mere',
            scmRef: 'une-souche',
            after: new Date('1925-01-14T14:29:14.416Z'),
          },
          {
            appName: 'l-appli-de-mon-cousin',
            scmRef: 'un-rameau',
            after: new Date('2015-01-14T14:29:14.416Z'),
          },
          {
            appName: 'ma-super-appli',
            scmRef: 'ma-vieille-branche',
            after: new Date('2025-01-14T14:29:14.416Z'),
          },
        ]);
      });
    });

    describe('when a deployment already exists for the app', () => {
      it('should update the deployment', async function () {
        // given
        await knex
          .insert({
            appName: 'ma-super-appli',
            scmRef: 'ma-vieille-branche',
            after: new Date('2024-12-31T14:29:14.416Z'),
          })
          .into(TABLE_NAME);

        const deployment = {
          appName: 'ma-super-appli',
          scmRef: 'ma-nouvelle-branche',
          after: new Date('2025-01-14T14:29:14.416Z'),
        };

        // when
        await reviewAppDeploymentRepository.save(deployment);

        // then
        const reviewAppDeployments = await knex.select().from(TABLE_NAME);

        expect(reviewAppDeployments).to.deep.equal([
          {
            appName: 'ma-super-appli',
            scmRef: 'ma-nouvelle-branche',
            after: new Date('2025-01-14T14:29:14.416Z'),
          },
        ]);
      });
    });
  });

  describe('#remove', function () {
    it('should remove deployment by appName', async function () {
      // given
      await knex
        .insert({
          appName: 'l-appli-de-mon-cousin',
          scmRef: 'un-rameau',
          after: new Date('2015-01-14T14:29:14.416Z'),
        })
        .into(TABLE_NAME);
      await knex
        .insert({
          appName: 'l-appli-de-ma-grand-mere',
          scmRef: 'une-souche',
          after: new Date('1925-01-14T14:29:14.416Z'),
        })
        .into(TABLE_NAME);

      // when
      await reviewAppDeploymentRepository.remove('l-appli-de-mon-cousin');

      // then
      const reviewAppDeployments = await knex.select().from(TABLE_NAME);

      expect(reviewAppDeployments).to.deep.equal([
        {
          appName: 'l-appli-de-ma-grand-mere',
          scmRef: 'une-souche',
          after: new Date('1925-01-14T14:29:14.416Z'),
        },
      ]);
    });
  });

  describe('#listForDeployment', () => {
    let readyTime1, readyTime2, notReadyTime;

    beforeEach(async function () {
      const now = new Date();
      readyTime1 = new Date(now.getTime() - 2000);
      readyTime2 = new Date(now.getTime() - 1000);
      notReadyTime = new Date(now.getTime() + 1000);

      await knex
        .insert({
          appName: 'l-appli-de-mon-cousin',
          scmRef: 'un-rameau',
          after: notReadyTime,
        })
        .into(TABLE_NAME);
      await knex
        .insert({
          appName: 'l-appli-de-ma-grand-mere',
          scmRef: 'une-souche',
          after: readyTime2,
        })
        .into(TABLE_NAME);
      await knex
        .insert({
          appName: 'ma-super-appli',
          scmRef: 'ma-nouvelle-branche',
          after: readyTime1,
        })
        .into(TABLE_NAME);
    });

    it('should list ready deployments', async function () {
      // when
      const result = await reviewAppDeploymentRepository.listForDeployment();

      // then
      expect(result).to.deep.equal([
        {
          appName: 'ma-super-appli',
          scmRef: 'ma-nouvelle-branche',
          after: readyTime1,
        },
        {
          appName: 'l-appli-de-ma-grand-mere',
          scmRef: 'une-souche',
          after: readyTime2,
        },
      ]);
    });
  });

  describe('when in a transaction', () => {
    it('should lock when listing for deployment', async function () {
      // given
      const now = new Date();
      const readyTime = new Date(now.getTime() - 1000);

      await knex
        .insert({
          appName: 'l-appli-de-ma-grand-mere',
          scmRef: 'une-souche',
          after: readyTime,
        })
        .into(TABLE_NAME);
      await knex
        .insert({
          appName: 'ma-super-appli',
          scmRef: 'ma-nouvelle-branche',
          after: readyTime,
        })
        .into(TABLE_NAME);

      const { promise: locked, resolve: resolveLocked } = Promise.withResolvers();

      // when
      const [updates] = await Promise.all([
        locked.then(() =>
          Promise.all([
            knex(TABLE_NAME).update({ scmRef: 'branche-d-accord' }).where('appName', 'ma-super-appli'),
            knex(TABLE_NAME).update({ scmRef: 'branche-d-accord' }).where('appName', 'l-appli-de-ma-grand-mere'),
          ]),
        ),
        knex.transaction(async (transaction) => {
          await reviewAppDeploymentRepository.listForDeployment(transaction);
          resolveLocked();
          await reviewAppDeploymentRepository.remove('ma-super-appli', transaction);
        }),
      ]);

      // then
      expect(updates).to.deep.equal([0, 1]);

      const reviewAppDeployments = await knex.select().from(TABLE_NAME);

      expect(reviewAppDeployments).to.deep.equal([
        {
          appName: 'l-appli-de-ma-grand-mere',
          scmRef: 'branche-d-accord',
          after: readyTime,
        },
      ]);
    });
  });
});
