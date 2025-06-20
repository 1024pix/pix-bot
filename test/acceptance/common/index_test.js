import pkg from '../../../package.json' with { type: 'json' };
const { version } = pkg;

import server from '../../../server.js';
import { expect, StatusCodes, sinon } from '../../test-helper.js';
import { knex } from '../../../db/knex-database-connection.js';
import slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message.js';
import { config } from '../../../config.js';

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

  describe('POST /api/application/deployed', function () {
    beforeEach(async function () {
      await knex('applications_deployments').delete();
      config.authorizationToken = 'helloworld';
    });

    it('should create a version and mark app deployed', async function () {
      // given
      const payload = {
        type_data: {
          git_ref: 'v1.0.0',
          status: 'success',
        },
        app_name: 'pix-app',
      };

      // when
      const res = await server.inject({
        method: 'POST',
        url: '/api/application/deployed?environment=local&token=helloworld',
        payload,
      });

      // then
      expect(res.statusCode).to.equal(StatusCodes.OK);
      const pixApp = await knex('applications_deployments')
        .where({ environment: 'local', version: 'v1.0.0', 'app-name': 'pix-app' })
        .first();
      expect(pixApp['is-deployed']).to.be.true;
    });

    it('should send notification when all application are deployed', async function () {
      // given
      const environment = 'local';
      const version = 'v1.0.0';
      for (const application of config.PIX_APPS) {
        await knex('applications_deployments').insert({
          environment,
          version,
          'app-name': application,
          'is-deployed': true,
        });
      }
      await knex('applications_deployments')
        .where({ environment, version, 'app-name': config.PIX_APPS[0] })
        .update({ 'is-deployed': false });
      sinon.stub(slackPostMessageService, 'postMessage').resolves(true);
      const payload = {
        type_data: {
          git_ref: version,
          status: 'success',
        },
        app_name: config.PIX_APPS[0],
      };

      // when
      const res = await server.inject({
        method: 'POST',
        url: `/api/application/deployed?environment=${environment}&token=helloworld`,
        payload,
      });

      // then
      expect(res.statusCode).to.equal(StatusCodes.OK);
      expect(slackPostMessageService.postMessage.calledOnce).to.be.true;
      const application = await knex('applications_deployments')
        .where({ environment, version, 'app-name': config.PIX_APPS[0] })
        .first();
      expect(application['is-deployed']).to.be.true;
    });

    it('should return a 422 error if application is not in PIX_APPS', async function () {
      // given
      const payload = {
        type_data: {
          git_ref: 'v1.0.0',
          status: 'success',
        },
        app_name: 'unknown-app',
      };

      // when
      const res = await server.inject({
        method: 'POST',
        url: '/api/application/deployed?environment=local&token=helloworld',
        payload,
      });

      // then
      expect(res.statusCode).to.equal(StatusCodes.UNPROCESSABLE_ENTITY);
    });

    it('should return a 401 if token is invalid', async function () {
      // given
      const payload = {
        type_data: {
          git_ref: 'v1.0.0',
          status: 'success',
        },
        app_name: 'pix-app',
      };

      // when
      const res = await server.inject({
        method: 'POST',
        url: '/api/application/deployed?environment=local&token=invalid-token',
        payload,
      });

      // then
      expect(res.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
    });

    it('should return 200 if status is not success', async function () {
      // given
      for (const app of config.PIX_APPS) {
        await knex('applications_deployments').insert({
          environment: 'local',
          version: 'v1.0.0',
          'app-name': app,
          'is-deployed': false,
        });
      }
      const payload = {
        type_data: {
          git_ref: 'v1.0.0',
          status: 'failure',
        },
        app_name: 'pix-app',
      };

      // when
      const res = await server.inject({
        method: 'POST',
        url: '/api/application/deployed?environment=local&token=helloworld',
        payload,
      });

      // then
      expect(res.statusCode).to.equal(StatusCodes.OK);
      const pixApp = await knex('applications_deployments')
        .where({ environment: 'local', version: 'v1.0.0', 'app-name': 'pix-app' })
        .first();
      expect(pixApp['is-deployed']).to.be.false;
    });
  });
});
