const {
  expect,
  nock,
  createSlackWebhookSignatureHeaders,
  nockGithubWithNoConfigChanges,
  nockGithubWithConfigChanges,
} = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Run | Slack', function () {
  describe('POST /run/slack/interactive-endpoint', function () {
    it('responds with 204', async function () {
      const body = {
        type: 'view_closed',
      };
      const res = await server.inject({
        method: 'POST',
        url: '/run/slack/interactive-endpoint',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(204);
    });

    it('responds with 401', async function () {
      const body = {
        type: 'view_closed',
      };
      const res = await server.inject({
        method: 'POST',
        url: '/run/slack/interactive-endpoint',
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });

    describe('when using the shortcut deploy-release', function () {
      it('calls slack with the tag selection modal', async function () {
        const slackCall = nock('https://slack.com')
          .post('/api/views.open', {
            trigger_id: 'payload id',
            view: {
              type: 'modal',
              callback_id: 'release-tag-selection',
              title: {
                type: 'plain_text',
                text: 'Déployer une release',
              },
              submit: {
                type: 'plain_text',
                text: 'Déployer',
              },
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  type: 'input',
                  block_id: 'deploy-release-tag',
                  label: {
                    type: 'plain_text',
                    text: 'Numéro de release',
                  },
                  element: {
                    type: 'plain_text_input',
                    action_id: 'release-tag-value',
                    placeholder: {
                      type: 'plain_text',
                      text: 'Ex : v2.130.0',
                    },
                  },
                },
              ],
            },
          })
          .reply(200);
        const body = {
          type: 'shortcut',
          callback_id: 'deploy-release',
          trigger_id: 'payload id',
        };
        const res = await server.inject({
          method: 'POST',
          url: '/run/slack/interactive-endpoint',
          headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
          payload: body,
        });
        expect(res.statusCode).to.equal(204);
        expect(slackCall.isDone()).to.be.true;
      });

      describe('with the callback release-tag-selection', function () {
        it('returns the confirmation modal', async function () {
          nockGithubWithNoConfigChanges();

          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-tag-selection',
              state: {
                values: {
                  'deploy-release-tag': {
                    'release-tag-value': {
                      value: 'v2.130.0',
                    },
                  },
                },
              },
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/run/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'push',
            view: {
              type: 'modal',
              callback_id: 'release-deployment-confirmation',
              private_metadata: 'v2.130.0',
              title: {
                type: 'plain_text',
                text: 'Confirmation',
              },
              submit: {
                type: 'plain_text',
                text: '🚀 Go !',
              },
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: "Vous vous apprêtez à déployer la version *v2.130.0* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?",
                  },
                },
              ],
            },
          });
        });

        it('returns the confirmation modal with a warning', async function () {
          nockGithubWithConfigChanges();

          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-tag-selection',
              state: {
                values: {
                  'deploy-release-tag': {
                    'release-tag-value': {
                      value: 'v2.130.0',
                    },
                  },
                },
              },
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/run/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'push',
            view: {
              type: 'modal',
              callback_id: 'release-deployment-confirmation',
              private_metadata: 'v2.130.0',
              title: {
                type: 'plain_text',
                text: 'Confirmation',
              },
              submit: {
                type: 'plain_text',
                text: '🚀 Go !',
              },
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: ":warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo PRODUCTION*.",
                  },
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: "Vous vous apprêtez à déployer la version *v2.130.0* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?",
                  },
                },
              ],
            },
          });
        });
      });

      describe('callback release-deployment-confirmation', function () {
        it('deploy the app', async function () {
          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-deployment-confirmation',
              private_metadata: 'v2.130.0',
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/run/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'clear',
          });
        });
      });
    });
  });
});
