const { expect, sinon } = require('../../test-helper');
const slackPostMessageService = require('../../../common/services/slack/surfaces/messages/post-message');
const server = require('../../../server');
const { describe } = require('mocha');

describe('Integration | Build | Scalingo', function () {
  beforeEach(function () {
    sinon.stub(console, 'log');
  });

  describe('POST /build/scalingo/deploy-endpoint', function () {
    describe('when scalingo build status is "build-error" ', () => {
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

    describe('when scalingo build status is not "build-error" ', () => {
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
});
