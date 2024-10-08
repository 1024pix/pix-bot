import * as pullRequestRepository from '../../../../build/repositories/pull-request-repository.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { expect } from '../../../test-helper.js';

describe('PullRequestRepository', function () {
  beforeEach(async function () {
    await knex('pull_requests').delete();
  });

  describe('#save', function () {
    it('stores pull request to be merged', async function () {
      await pullRequestRepository.save({ number: 123, repositoryName: 'pix-sample-repo' });

      // eslint-disable-next-line no-unused-vars
      const { created_at, ...result } = await knex('pull_requests')
        .select()
        .where({ number: 123, repositoryName: 'pix-sample-repo' })
        .first();
      expect(result).to.deep.equal({
        number: 123,
        repositoryName: 'pix-sample-repo',
        isCurrentlyMerging: false,
      });
    });
  });

  describe('#isAtLeastOneMergeInProgress', function () {
    context('when there is at least one pr in merging', function () {
      it('should return true', async function () {
        await knex('pull_requests').insert({ number: 123, repositoryName: 'pix-sample-repo', isCurrentlyMerge: true });

        const isCurrentlyMerging = await pullRequestRepository.isAtLeastOneMergeInProgress();

        expect(isCurrentlyMerging).to.be.true;
      });
    });

    context('when no pr are currently in progress', function () {
      it('should return false', async function () {
        await knex('pull_requests').insert({ number: 123, repositoryName: 'pix-sample-repo', isCurrentlyMerge: false });

        const isCurrentlyMerging = await pullRequestRepository.isAtLeastOneMergeInProgress();

        expect(isCurrentlyMerging).to.be.false;
      });
    });
  });

  describe('#update', function () {
    it('should update only the given pull_request', async function () {
      await knex('pull_requests').insert({ number: 123, repositoryName: 'pix-sample-repo', isCurrentlyMerge: false });
      await knex('pull_requests').insert({ number: 1234, repositoryName: 'pix-sample-repo', isCurrentlyMerge: false });

      await pullRequestRepository.update({ number: 1234, repositoryName: 'pix-sample-repo', isCurrentlyMerge: true });

      const results = await knex('pull_requests').where({ isCurrentlyMerge: true });
      expect(results).to.have.been.lengthOf(1);
    });
  });
});
