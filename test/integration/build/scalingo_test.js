import slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message.js';
import server from '../../../server.js';
import { expect, nock, sinon } from '../../test-helper.js';

import { knex } from '../../../db/knex-database-connection.js';
import { logger } from '../../../common/services/logger.js';

describe('Integration | Build | Scalingo', function () {
  describe('POST /build/scalingo/deploy-endpoint', function () {
    describe('when scalingo build status is "build-error" ', function () {
      it('should send slack message and return 200', async function () {
        // Given
        const body = {
          app_name: 'pix-github-actions-test',
          user: {
            username: 'pix-dev',
          },
          type_data: {
            pusher: 'pix-dev',
            git_ref: '23f2471edd07284945abf0f303c99c6c5582986c',
            status: 'build-error',
            finished_at: '2022-07-22T13:17:01.873+00:00',
            deployment_uuid: 'c6535ea5-ef4c-46af-aa1d-c71d214e17a9',
          },
        };
        sinon.stub(slackPostMessageService, 'postMessage').resolves('ok');

        // When
        const res = await server.inject({
          method: 'POST',
          url: '/build/scalingo/deploy-endpoint',
          payload: body,
        });

        // Then
        const expectedPayload = [
          {
            color: '#A95800',
            blocks: [
              {
                text: {
                  type: 'mrkdwn',
                  text: '*<https://dashboard.scalingo.com/apps/osc-fr1/pix-github-actions-test/activity|[pix-github-actions-test] App deployed>*',
                },
                type: 'section',
              },
              {
                fields: [
                  {
                    type: 'mrkdwn',
                    text: "*Deployment failed*\nWith status 'build-error'",
                  },
                  {
                    type: 'mrkdwn',
                    text: '*Deployment logs*\n<https://dashboard.scalingo.com/apps/osc-fr1/pix-github-actions-test/deploy/c6535ea5-ef4c-46af-aa1d-c71d214e17a9|pix-github-actions-test>',
                  },
                ],
                type: 'section',
              },
              {
                fields: [
                  { type: 'mrkdwn', text: '*Pusher*\npix-dev' },
                  {
                    type: 'mrkdwn',
                    text: '*Git SHA*\n23f2471edd07284945abf0f303c99c6c5582986c',
                  },
                ],
                type: 'section',
              },
              {
                elements: [{ type: 'mrkdwn', text: 'By pix-dev | Jul 22' }],
                type: 'context',
              },
            ],
            fallback: '[pix-github-actions-test] App deployment error',
          },
        ];
        expect(slackPostMessageService.postMessage).to.have.been.calledWith({
          message: '[pix-github-actions-test] App deployment error',
          attachments: JSON.stringify(expectedPayload),
        });
        expect(res.statusCode).to.equal(200);
      });
    });

    describe('when scalingo build status is not "build-error" ', function () {
      it('should not send slack message and return 200', async function () {
        // Given
        const body = {
          app_name: 'pix-github-actions-test',
          user: {
            username: 'pix-dev',
          },
          type_data: {
            pusher: 'pix-dev',
            git_ref: '23f2471edd07284945abf0f303c99c6c5582986c',
            status: 'success',
            finished_at: '2022-07-22T13:17:01.873+00:00',
            deployment_uuid: 'c6535ea5-ef4c-46af-aa1d-c71d214e17a9',
          },
        };
        sinon.stub(slackPostMessageService, 'postMessage').resolves('ok');

        // When
        const res = await server.inject({
          method: 'POST',
          url: '/build/scalingo/deploy-endpoint',
          payload: body,
        });

        // Then
        expect(slackPostMessageService.postMessage).not.to.have.been.called;
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('POST /build/scalingo/review-app-deploy-endpoint', function () {
    afterEach(async function () {
      await knex('review-apps').truncate();
    });

    describe('when the event received is not a deployment', function () {
      it('should not mark the review app as deployed', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        await knex('review-apps').insert({
          name: appName,
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
        });
        const errorLoggerStub = sinon.stub(logger, 'error');

        const payload = {
          type_data: {
            status: 'success',
            deployment_type: 'deployment',
          },
          app_name: appName,
          type: 'other-type',
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(errorLoggerStub.calledWith({ event: 'review-app-deploy', message: `The event type is not deployment.` }))
          .to.be.true;
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp.status).to.equal('pending');
      });
    });

    describe('when the deployement_type is not deployment', function () {
      it('should not mark the review app as deployed', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        await knex('review-apps').insert({
          name: appName,
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
        });
        const errorLoggerStub = sinon.stub(logger, 'error');

        const payload = {
          type_data: {
            status: 'success',
            deployment_type: 'other-type',
          },
          app_name: appName,
          type: 'deployment',
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(errorLoggerStub.calledWith({ event: 'review-app-deploy', message: `The event type is not deployment.` }))
          .to.be.true;
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp.status).to.equal('pending');
      });
    });

    describe('when the status of the deployment event is not managed', function () {
      it('should not mark the review app as deployed', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        await knex('review-apps').insert({
          name: appName,
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
        });
        const warnLoggerStub = sinon.stub(logger, 'warn');

        const payload = {
          type_data: {
            status: 'building',
            deployment_type: 'deployment',
          },
          app_name: appName,
          type: 'deployment',
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(
          warnLoggerStub.calledWith({
            event: 'review-app-deploy',
            message: `The status "building" is not managed by this hook.`,
          }),
        ).to.be.true;
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp.status).to.equal('pending');
      });
    });

    describe('when the event received is not for a review app', function () {
      it('should not mark the review app as deployed', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        await knex('review-apps').insert({
          name: appName,
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
        });
        const errorLoggerStub = sinon.stub(logger, 'error');

        const payload = {
          type_data: {
            status: 'success',
            deployment_type: 'deployment',
          },
          app_name: 'pix-api-production',
          type: 'deployment',
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(
          errorLoggerStub.calledWith({
            event: 'review-app-deploy',
            message: `The application pix-api-production is not linked to a pull request.`,
          }),
        ).to.be.true;
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp.status).to.equal('pending');
      });
    });

    describe('when the deployment id is not the last deployment id', function () {
      it('should not mark the review app as deployed', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        await knex('review-apps').insert({
          name: appName,
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
          status: 'pending',
          lastDeploymentId: 'deployment-id-456',
        });
        const payload = {
          type_data: {
            status: 'success',
            deployment_type: 'deployment',
            git_ref: 'abc123',
            deployment_uuid: 'deployment-id-123',
          },
          app_name: appName,
          type: 'deployment',
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp).to.have.property('status', 'pending');
        expect(reviewApp).to.have.property('lastDeploymentId', 'deployment-id-456');
      });
    });

    describe('when the deployment status is success', function () {
      it('should mark the review app as deployed', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        await knex('review-apps').insert({
          name: appName,
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
          status: 'pending',
          lastDeploymentId: 'deployment-id-123',
        });
        await knex('review-apps').insert({
          name: 'pix-admin-review-pr123',
          repository: 'pix',
          prNumber: 123,
          parentApp: 'pix-api-review',
          status: 'pending',
          lastDeploymentId: 'deployment-id-456',
        });
        const payload = {
          type_data: {
            status: 'success',
            deployment_type: 'deployment',
            git_ref: 'abc123',
            deployment_uuid: 'deployment-id-123',
          },
          app_name: appName,
          type: 'deployment',
        };
        const addRADeploymentCheckNock = nock('https://api.github.com')
          .post(`/repos/1024pix/pix/statuses/abc123`, {
            context: 'check-ra-deployment',
            state: 'pending',
          })
          .reply(201, { started_at: new Date() });

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp).to.have.property('status', 'success');
        expect(reviewApp).to.have.property('lastDeploymentId', null);
        expect(addRADeploymentCheckNock.isDone()).to.be.true;
      });

      describe('when all the review apps are deployed', function () {
        it('should update the commit status check state', async function () {
          // given
          const appName = 'pix-api-review-pr123';
          const repository = 'pix';
          const prNumber = 123;
          await knex('review-apps').insert({
            name: appName,
            repository,
            prNumber,
            parentApp: 'pix-api-review',
            status: 'pending',
          });
          await knex('review-apps').insert({
            name: 'pix-admin-review-pr123',
            repository,
            prNumber,
            parentApp: 'pix-api-review',
            status: 'success',
          });
          await knex('review-apps').insert({
            name: 'pix-audit-logger-review-pr123',
            repository,
            prNumber,
            parentApp: 'pix-api-review',
            status: 'success',
          });

          const sha = 'a-commit-sha';

          const addRADeploymentCheckNock = nock('https://api.github.com')
            .post(`/repos/1024pix/${repository}/statuses/${sha}`, {
              context: 'check-ra-deployment',
              state: 'success',
            })
            .reply(201, { started_at: new Date() });

          const payload = {
            type_data: {
              status: 'success',
              deployment_type: 'deployment',
              git_ref: sha,
            },
            app_name: appName,
            type: 'deployment',
          };

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/build/scalingo/review-app-deploy-endpoint',
            payload,
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(addRADeploymentCheckNock.isDone()).to.be.true;
        });
      });
    });

    describe('when the deployment status is error', function () {
      it('should mark the review app as failure and set the check as failure', async function () {
        // given
        const appName = 'pix-api-review-pr123';
        const repository = 'pix';
        const prNumber = 123;
        await knex('review-apps').insert({
          name: appName,
          repository,
          prNumber,
          parentApp: 'pix-api-review',
        });
        await knex('review-apps').insert({
          name: 'pix-admin-review-pr123',
          repository,
          prNumber,
          parentApp: 'pix-api-review',
        });

        const sha = 'a-commit-sha';

        const addRADeploymentCheckNock = nock('https://api.github.com')
          .post(`/repos/1024pix/${repository}/statuses/${sha}`, {
            context: 'check-ra-deployment',
            state: 'failure',
          })
          .reply(201, { started_at: new Date() });

        const payload = {
          type_data: {
            status: 'build-error',
            deployment_type: 'deployment',
            git_ref: sha,
          },
          app_name: appName,
          type: 'deployment',
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/review-app-deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(200);
        const reviewApp = await knex('review-apps').where({ name: appName }).first();
        expect(reviewApp.status).to.equal('failure');
        expect(addRADeploymentCheckNock.isDone()).to.be.true;
      });
    });
  });
});
