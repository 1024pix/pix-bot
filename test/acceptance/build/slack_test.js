const {
  expect,
  nock,
  createSlackWebhookSignatureHeaders,
  nockGithubWithNoConfigChanges,
  nockGithubWithConfigChanges,
} = require('../../test-helper');
const server = require('../../../server');

describe.only('Acceptance | Build | Slack', function () {
  describe('POST /build/slack/interactive-endpoint', function () {
    it('responds with 204', async function () {
      const body = {
        type: 'view_closed',
      };
      const res = await server.inject({
        method: 'POST',
        url: '/build/slack/interactive-endpoint',
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
        url: '/build/slack/interactive-endpoint',
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });

    describe('when using the shortcut publish-release', function () {
      it('calls slack with the tag selection modal', async function () {
        const slackCall = nock('https://slack.com')
          .post('/api/views.open', {
            trigger_id: 'trigger id',
            view: {
              type: 'modal',
              callback_id: 'release-type-selection',
              title: {
                type: 'plain_text',
                text: 'Publier une release',
              },
              submit: {
                type: 'plain_text',
                text: 'Publier',
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
                    text: "Pix utilise le format de gestion de versions _Semantic Versionning_ :\n- *patch* : contient exclusivement des correctif(s)\n- *minor* : contient au moins 1 évolution technique ou fonctionnelle\n- *major* : contient au moins 1 changement majeur d'architecture",
                  },
                },
                {
                  type: 'divider',
                },
                {
                  type: 'input',
                  block_id: 'publish-release-type',
                  label: {
                    type: 'plain_text',
                    text: 'Type de release',
                  },
                  element: {
                    action_id: 'release-type-option',
                    type: 'static_select',
                    placeholder: {
                      type: 'plain_text',
                      text: 'Selectionnez un élément',
                    },
                    initial_option: {
                      text: {
                        type: 'plain_text',
                        text: 'Minor',
                      },
                      value: 'minor',
                    },
                    options: [
                      {
                        text: {
                          type: 'plain_text',
                          text: 'Minor',
                        },
                        value: 'minor',
                      },
                      {
                        text: {
                          type: 'plain_text',
                          text: 'Patch',
                        },
                        value: 'patch',
                      },
                      {
                        text: {
                          type: 'plain_text',
                          text: 'Major',
                        },
                        value: 'major',
                      },
                    ],
                  },
                },
              ],
            },
          })
          .reply(200);
        const body = {
          type: 'shortcut',
          callback_id: 'publish-release',
          trigger_id: 'trigger id',
        };
        const res = await server.inject({
          method: 'POST',
          url: '/build/slack/interactive-endpoint',
          headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
          payload: body,
        });
        expect(res.statusCode).to.equal(204);
        expect(slackCall.isDone()).to.be.true;
      });

      describe('with the callback release-type-selection', function () {
        it('returns the confirmation modal', async function () {
          nockGithubWithNoConfigChanges();

          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-type-selection',
              state: {
                values: {
                  'publish-release-type': {
                    'release-type-option': {
                      selected_option: {
                        value: 'minor',
                      },
                    },
                  },
                },
              },
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/build/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'push',
            view: {
              type: 'modal',
              callback_id: 'release-publication-confirmation',
              private_metadata: 'minor',
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
                    text: 'Vous vous apprêtez à publier une version *minor* et la déployer en recette. Êtes-vous sûr de vous ?',
                  },
                },
              ],
            },
          });
        });

        it.only('returns the confirmation modal with a warning', async function () {
          nockGithubWithConfigChanges();

          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-type-selection',
              state: {
                values: {
                  'publish-release-type': {
                    'release-type-option': {
                      selected_option: {
                        value: 'major',
                      },
                    },
                  },
                },
              },
            },
          };

          const res = await server.inject({
            method: 'POST',
            url: '/build/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'push',
            view: {
              type: 'modal',
              callback_id: 'release-publication-confirmation',
              private_metadata: 'major',
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
                    text: ":warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.",
                  },
                },
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: 'Vous vous apprêtez à publier une version *major* et la déployer en recette. Êtes-vous sûr de vous ?',
                  },
                },
              ],
            },
          });
        });
      });

      describe('callback release-publication-confirmation', function () {
        it('publish and deploy the app', async function () {
          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-publication-confirmation',
              private_metadata: 'major',
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/build/slack/interactive-endpoint',
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
