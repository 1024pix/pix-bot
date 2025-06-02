import pkg from '../../../package.json' with { type: 'json' };
const { version } = pkg;

import server from '../../../server.js';
import { expect, StatusCodes } from '../../test-helper.js';
import { knex } from '../../../db/knex-database-connection.js';

describe('Acceptance | Common | Index', function () {
  describe('on every route', function () {
    context('when an error is thrown', function () {
      it('should respond an INTERNAL_SERVER_ERROR (500)', async function () {
        // given
        server.route([
          {
            method: 'GET',
            path: '/throw-error',
            handler: () => {
              throw new Error('Some developer-oriented diagnostic message');
            },
          },
        ]);
        const response = await server.inject({
          method: 'GET',
          url: '/throw-error',
        });
        expect(response.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.result.message).to.equal('An internal server error occurred');
      });
    });
  });

  it('should respond NOT_FOUND (404)', async function () {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/should-not-exist',
    });
    expect(statusCode).to.equal(StatusCodes.NOT_FOUND);
  });

  describe('GET /', function () {
    it('responds with 200', async function () {
      const res = await server.inject({
        method: 'GET',
        url: '/',
      });
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.payload)).to.deep.equal({
        name: 'pix-bot',
        version,
        description: 'Automating development actions',
      });
    });
  });

  describe('GET /slackviews', function () {
    it('responds with 200', async function () {
      const res = await server.inject({
        method: 'GET',
        url: '/slackviews',
      });
      expect(res.statusCode).to.equal(200);
    });
  });

  describe('POST /deployment-succeeded', function () {
    it('should return 200 code http', async function () {
      // when
      const res = await server.inject({
        method: 'POST',
        url: '/deployment-succeeded',
        payload: {
          appName: 'pix-api-local',
          tag: 'V1.0.0',
        },
      });

      // then
      expect(res.statusCode).to.equal(200);
      const result = await knex('deployments').where({ tag: 'V1.0.0' }).first();
      expect(result['pix-api']).to.be.true;
    });
  });
});
