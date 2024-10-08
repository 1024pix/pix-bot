import * as pullRequestRepository from '../../../../build/repositories/pull-request-repository.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { expect } from '../../../test-helper.js';
import { describe } from 'mocha';

describe('PullRequestRepository', function () {
  beforeEach(async function () {
    await knex('pull_requests').delete();
  });

  describe('#save', function () {
    it('stores pull request to be merged', async function () {
      await pullRequestRepository.save({ number: 123, repositoryName: 'pix-sample-repo' });

      // eslint-disable-next-line no-unused-vars
      const { createdAt, ...result } = await knex('pull_requests')
        .select()
        .where({ number: 123, repositoryName: 'pix-sample-repo' })
        .first();
      expect(result).to.deep.equal({
        number: 123,
        repositoryName: 'pix-sample-repo',
        isMerging: false,
      });
    });
  });

  describe('#isAtLeastOneMergeInProgress', function () {
    context('when there is at least one pr in merging', function () {
      it('should return true', async function () {
        await knex('pull_requests').insert({ number: 123, repositoryName: 'pix-sample-repo', isMerging: true });

        const isMerging = await pullRequestRepository.isAtLeastOneMergeInProgress();

        expect(isMerging).to.be.true;
      });
    });

    context('when no pr are currently in progress', function () {
      it('should return false', async function () {
        await knex('pull_requests').insert({ number: 123, repositoryName: 'pix-sample-repo', isMerging: false });

        const isMerging = await pullRequestRepository.isAtLeastOneMergeInProgress();

        expect(isMerging).to.be.false;
      });
    });
  });

  describe('#getOldest', function () {
    context('when there is at least one pr', function () {
      it('should return oldest pull request', async function () {
        await knex('pull_requests').insert({
          number: 123,
          repositoryName: 'pix-sample-repo',
          isMerging: true,
          createdAt: new Date('2024-01-01'),
        });
        await knex('pull_requests').insert({
          number: 456,
          repositoryName: 'pix-sample-repo',
          isMerging: false,
          createdAt: new Date('2024-01-02'),
        });
        await knex('pull_requests').insert({
          number: 789,
          repositoryName: 'pix-sample-repo',
          isMerging: false,
          createdAt: new Date('2024-02-02'),
        });

        const oldestPR = await pullRequestRepository.getOldest();

        expect(oldestPR.number).to.be.equal(456);
      });
    });

    context('when there are no pr', function () {
      it('should return undefined', async function () {
        const oldestPR = await pullRequestRepository.getOldest();

        expect(oldestPR).to.be.undefined;
      });
    });
  });

  describe('#update', function () {
    it('should update only the given pull_request', async function () {
      await knex('pull_requests').insert({ number: 123, repositoryName: 'pix-sample-repo', isMerging: false });
      await knex('pull_requests').insert({ number: 1234, repositoryName: 'pix-sample-repo', isMerging: false });

      await pullRequestRepository.update({ number: 1234, repositoryName: 'pix-sample-repo', isMerging: true });

      const results = await knex('pull_requests').where({ isMerging: true });
      expect(results).to.have.been.lengthOf(1);
    });
  });
});
