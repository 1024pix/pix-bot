import server from '../../../server.js';
import { expect, nock } from '../../test-helper.js';
import { knex } from '../../../db/knex-database-connection.js';
import { describe } from 'mocha';
import { config } from '../../../config.js';

describe('Acceptance | Build | Merge', function () {
  beforeEach(async function () {
    await knex('pull_requests').truncate();
  });

  describe('POST /merge', function () {
    describe('when user is not authenticated', function () {
      it('responds with 401', async function () {
        const body = { pullRequest: '1024pix/pix-test/1' };

        const res = await server.inject({
          method: 'POST',
          url: '/merge',
          payload: body,
        });

        expect(res.statusCode).to.equal(401);
      });
    });

    describe('when user is authenticated', function () {
      it('responds with 200 and remove PR in database', async function () {
        await knex('pull_requests').insert({ repositoryName: '1024pix/pix-test', number: 1 });
        const body = { pullRequest: '1024pix/pix-test/1' };
        const prHeadCommit = 'sha1';
        nock('https://api.github.com')
          .get('/repos/1024pix/pix-test/pulls/1')
          .reply(200, { head: { sha: prHeadCommit } });

        nock('https://api.github.com')
          .post(`/repos/1024pix/pix-test/statuses/${prHeadCommit}`)
          .reply(201, { started_at: '2024-01-01' });

        const res = await server.inject({
          method: 'POST',
          url: '/merge',
          headers: {
            Authorization: `Bearer ${config.authorizationToken}`,
          },
          payload: body,
        });

        expect(res.statusCode).to.equal(204);
        const result = await knex('pull_requests').where({ repositoryName: '1024pix/pix-test', number: 1 }).first();
        expect(result).to.equal(undefined);
      });
    });
  });
});
