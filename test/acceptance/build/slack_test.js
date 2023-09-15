const {
  expect,
  nock,
  createSlackWebhookSignatureHeaders,
  nockGithubWithNoConfigChanges,
} = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Build | Slack', function () {
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

        it('returns the confirmation modal with a warning and sends a slack message to tech-releases', async function () {
          // given
          const tagNock = nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/tags')
            .twice()
            .reply(200, [
              {
                commit: {
                  url: 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
                },
                name: 'v6.6.6',
              },
              {
                commit: {
                  url: 'https://api.github.com/repos/github-owner/github-repository/commits/456',
                },
                name: 'v6.6.5',
              },
            ]);

          const firstCommitNock = nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/commits/1234')
            .reply(200, {
              commit: {
                committer: {
                  date: '2021-04-14T12:40:50.326Z',
                },
              },
            });

          const commitsNock = nock('https://api.github.com')
            .filteringPath(
              /since=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z&until=\d{4}-\d{2}-\d{2}T\d{2}%3A\d{2}%3A\d{2}.\d{3}Z/g,
              'since=XXXX&until=XXXX',
            )
            .get('/repos/github-owner/github-repository/commits?since=XXXX&until=XXXX&path=api%2Flib%2Fconfig.js')
            .reply(200, [{}]);

          const message = `:warning: Il y a eu des ajout(s)/suppression(s) [dans le fichier config.js](https://github.com/1024pix/pix/compare/v6.6.6...dev). Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.`;

          const slackMessageNock = nock('https://slack.com')
            .post('/api/chat.postMessage', {
              channel: '#tech-releases',
              text: message,
            })
            .reply(200, {
              ok: true,
            });

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

          // when
          const res = await server.inject({
            method: 'POST',
            url: '/build/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });

          //then

          expect(tagNock.isDone()).to.be.true;
          expect(firstCommitNock.isDone()).to.be.true;
          expect(commitsNock.isDone()).to.be.true;
          expect(slackMessageNock.isDone()).to.be.true;

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
                    text: ":warning: Il y a eu des ajout(s)/suppression(s) dans le fichier <https://github.com/1024pix/pix/compare/v6.6.6...dev|*config.js*>. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.",
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
          // given
          const body = {
            type: 'view_submission',
            view: {
              callback_id: 'release-publication-confirmation',
              private_metadata: 'major',
            },
          };

          // when
          const res = await server.inject({
            method: 'POST',
            url: '/build/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });

          // then
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'clear',
          });
        });
      });
    });
  });
});
