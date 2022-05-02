const crypto = require('crypto');
const { expect, nock } = require('../../test-helper');
const server = require('../../../server');
const config = require('../../../config');

function createSlackWebhookSignatureHeaders(body) {
  const timestamp = Date.now();
  const version = 'v0';
  const hmac = crypto.createHmac('sha256', config.slack.requestSigningSecret);
  hmac.update(`${version}:${timestamp}:${body}`);

  return {
    'x-slack-signature': version +'='+ hmac.digest('hex'),
    'x-slack-request-timestamp': timestamp
  };
}

describe('Acceptance | Common | Slack', function() {
  describe('POST /slack/interactive-endpoint', function() {
    it('responds with 204', async () => {
      const body = {
        type: 'view_closed'
      };
      const res = await server.inject({
        method: 'POST',
        url: '/slack/interactive-endpoint',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(204);
    });

    it('responds with 401', async () => {
      const body = {
        type: 'view_closed'
      };
      const res = await server.inject({
        method: 'POST',
        url: '/slack/interactive-endpoint',
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });

    describe('when using the shortcut publish-release', function() {
      it('calls slack with the tag selection modal', async function() {
        const slackCall = nock('https://slack.com')
          .post('/api/views.open', {
            'trigger_id': 'trigger id',
            'view': {
              'type': 'modal',
              'callback_id': 'release-type-selection',
              'title': {
                'type': 'plain_text',
                'text': 'Publier une release',
                'emoji': true
              },
              'submit': {
                'type': 'plain_text',
                'text': 'Publier',
                'emoji': true
              },
              'close': {
                'type': 'plain_text',
                'text': 'Annuler',
                'emoji': true
              },
              'blocks': [
                {
                  'type': 'section',
                  'text': {
                    'type': 'mrkdwn',
                    'text': 'Pix utilise le format de gestion de versions _Semantic Versionning_ :\n- *patch* : contient exclusivement des correctif(s)\n- *minor* : contient au moins 1 évolution technique ou fonctionnelle\n- *major* : contient au moins 1 changement majeur d\'architecture'
                  }
                },
                {
                  'type': 'divider'
                },
                {
                  'type': 'input',
                  'block_id': 'publish-release-type',
                  'label': {
                    'type': 'plain_text',
                    'text': 'Type de release',
                    'emoji': true
                  },
                  'element': {
                    'action_id': 'release-type-option',
                    'type': 'static_select',
                    'placeholder': {
                      'type': 'plain_text',
                      'text': 'Selectionnez un élément'
                    },
                    'initial_option': {
                      'text': {
                        'type': 'plain_text',
                        'text': 'Minor'
                      },
                      'value': 'minor'
                    },
                    'options': [
                      {
                        'text': {
                          'type': 'plain_text',
                          'text': 'Minor'
                        },
                        'value': 'minor'
                      },
                      {
                        'text': {
                          'type': 'plain_text',
                          'text': 'Patch'
                        },
                        'value': 'patch'
                      },
                      {
                        'text': {
                          'type': 'plain_text',
                          'text': 'Major'
                        },
                        'value': 'major'
                      }
                    ]
                  }
                }
              ]
            }
          })
          .reply(200);
        const body = {
          type: 'shortcut',
          callback_id: 'publish-release',
          trigger_id: 'trigger id'
        };
        const res = await server.inject({
          method: 'POST',
          url: '/slack/interactive-endpoint',
          headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
          payload: body,
        });
        expect(res.statusCode).to.equal(204);
        expect(slackCall.isDone()).to.be.true;
      });
    });

    describe('when using the shortcut deploy-release', function() {
      it('calls slack with the tag selection modal', async function() {
        const slackCall = nock('https://slack.com')
          .post('/api/views.open', {
            'trigger_id': 'payload id',
            'view': {
              'type': 'modal',
              'callback_id': 'release-tag-selection',
              'title': {
                'type': 'plain_text',
                'text': 'Déployer une release',
                'emoji': true
              },
              'submit': {
                'type': 'plain_text',
                'text': 'Déployer',
                'emoji': true
              },
              'close': {
                'type': 'plain_text',
                'text': 'Annuler',
                'emoji': true
              },
              'blocks': [
                {
                  'type': 'input',
                  'block_id': 'deploy-release-tag',
                  'label': {
                    'type': 'plain_text',
                    'text': 'Numéro de release',
                    'emoji': true
                  },
                  'element': {
                    'type': 'plain_text_input',
                    'action_id': 'release-tag-value',
                    'placeholder': {
                      'type': 'plain_text',
                      'text': 'Ex : v2.130.0',
                      'emoji': true
                    }
                  }
                },
              ]
            }
          })
          .reply(200);
        const body = {
          type: 'shortcut',
          callback_id: 'deploy-release',
          trigger_id: 'payload id'
        };
        const res = await server.inject({
          method: 'POST',
          url: '/slack/interactive-endpoint',
          headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
          payload: body,
        });
        expect(res.statusCode).to.equal(204);
        expect(slackCall.isDone()).to.be.true;
      });

      describe('with the callback release-tag-selection', function() {

        it('returns the confirmation modal', async function () {

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/tags')
            .reply(200, [{
              'commit': {
                'url': 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
              },
            }]);

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/commits/1234')
            .reply(200, {
              commit: {
                'committer': {
                  'date': '2011-04-14'
                },
              }
            });

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/commits?since=2011-04-14&path=api%2Flib%2Fconfig.js')
            .reply(200, []);

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
            url: '/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(res.payload).to.deep.equal(JSON.stringify(
            {
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
                  emoji: true,
                },
                close: {
                  type: 'plain_text',
                  text: 'Annuler',
                  emoji: true,
                },
                blocks: [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: 'Vous vous apprêtez à déployer la version *v2.130.0* en production. Il s\'agit d\'une opération critique. Êtes-vous sûr de vous ?',
                    },
                  },
                ],
              },
            }
          ));
        });

        it('returns the confirmation modal with a warning', async function () {

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/tags')
            .reply(200, [{
              'commit': {
                'url': 'https://api.github.com/repos/github-owner/github-repository/commits/1234',
              },
            }]);

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/commits/1234')
            .reply(200, {
              commit: {
                'committer': {
                  'date': '2011-04-14'
                },
              }
            });

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/commits?since=2011-04-14&path=api%2Flib%2Fconfig.js')
            .reply(200, [{}]);

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
            url: '/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(res.payload).to.deep.equal(JSON.stringify(
            {
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
                  emoji: true,
                },
                close: {
                  type: 'plain_text',
                  text: 'Annuler',
                  emoji: true,
                },
                blocks: [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: ':warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d\'environnement sont bien à jour sur *Scalingo PRODUCTION*.'
                    }
                  },
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: 'Vous vous apprêtez à déployer la version *v2.130.0* en production. Il s\'agit d\'une opération critique. Êtes-vous sûr de vous ?',
                    },
                  },
                ],
              },
            }
          ));
        });
      });

      describe('callback release-deployment-confirmation', function() {
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
            url: '/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });
          expect(res.statusCode).to.equal(200);
          expect(res.payload).to.deep.equal(JSON.stringify({
            response_action: 'clear'
          }));
        });
      });
    });
  });
});

