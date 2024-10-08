import * as pullRequestRepository from '../../../../build/repositories/pull-request-repository.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { expect } from '../../../test-helper.js';

describe('PullRequestRepository', function () {
  context('#save', function () {
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
      });
    });
  });
});
