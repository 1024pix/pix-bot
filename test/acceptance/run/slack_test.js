import server from '../../../server.js';
import {
  createSlackWebhookSignatureHeaders,
  expect,
  nock,
  nockGithubWithConfigChanges,
  nockGithubWithNoConfigChanges,
  StatusCodes,
} from '../../test-helper.js';

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
        describe('when the Github API returns an error', function () {
          it('should return an INTERNAL_SERVER_ERROR (500)', async function () {
            // given
            const tagNock = nock('https://api.github.com')
              .get('/repos/github-owner/github-repository/tags')
              .reply(StatusCodes.FORBIDDEN, 'API rate limit exceeded for user ID 1. [rate reset in 8m48s]');

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

            // when
            const error = await server.inject({
              method: 'POST',
              url: '/run/slack/interactive-endpoint',
              headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
              payload: body,
            });

            // then
            expect(error.statusCode).to.equal(StatusCodes.SERVICE_UNAVAILABLE);
            expect(error.statusMessage).to.equal('Service Unavailable');
            expect(tagNock).to.have.been.requested;
          });
        });

        it('returns the confirmation modal', async function () {
          // given
          const nocks = nockGithubWithNoConfigChanges();

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

          // when
          const res = await server.inject({
            method: 'POST',
            url: '/run/slack/interactive-endpoint',
            headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
            payload: body,
          });

          // then
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
          nocks.checkAllNocksHaveBeenCalled();
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

    describe('when using the shortcut scalingo-app-creation', function () {
      it('calls slack with the create app modal', async function () {
        const slackCall = nock('https://slack.com')
          .post('/api/views.open', {
            trigger_id: 'payload id',
            view: {
              title: {
                type: 'plain_text',
                text: 'Créer une application',
              },
              submit: {
                type: 'plain_text',
                text: 'Créer',
              },
              callback_id: 'application-name-selection',
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  block_id: 'create-app-name',
                  label: {
                    type: 'plain_text',
                    text: "Nom de l'application",
                  },
                  element: {
                    action_id: 'scalingo-app-name',
                    placeholder: {
                      type: 'plain_text',
                      text: 'application-name',
                    },
                    initial_value: 'pix-super-application-recette',
                    type: 'plain_text_input',
                  },
                  type: 'input',
                },
                {
                  block_id: 'application-env',
                  label: {
                    type: 'plain_text',
                    text: 'Quelle région ?',
                  },
                  element: {
                    placeholder: {
                      type: 'plain_text',
                      text: 'Choisis la région',
                    },
                    action_id: 'item',
                    options: [
                      {
                        text: {
                          type: 'plain_text',
                          text: 'Paris - SecNumCloud - Outscale',
                        },
                        value: 'production',
                      },
                      {
                        text: {
                          type: 'plain_text',
                          text: 'Paris - Outscale',
                        },
                        value: 'recette',
                      },
                    ],
                    type: 'static_select',
                  },
                  type: 'input',
                },
              ],
              type: 'modal',
            },
          })
          .reply(200);
        const body = {
          type: 'shortcut',
          callback_id: 'scalingo-app-creation',
          trigger_id: 'payload id',
        };
        // when
        const res = await server.inject({
          method: 'POST',
          url: '/run/slack/interactive-endpoint',
          headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
          payload: body,
        });
        // then
        expect(res.statusCode).to.equal(204);
        expect(slackCall.isDone()).to.be.true;
      });

      describe('with the callback application-name-selection', function () {
        it('returns the confirmation modal', async function () {
          const slackBody = {
            ok: true,
            user: {
              profile: {
                email: 'john.doe@pix.fr',
              },
            },
          };
          const slackCall = nock('https://slack.com').get('/api/users.info?user=xxxxxx').reply(200, slackBody);
          const body = {
            type: 'view_submission',
            user: {
              id: 'xxxxxx',
            },
            view: {
              type: 'modal',
              private_metadata: '',
              callback_id: 'application-name-selection',
              state: {
                values: {
                  'create-app-name': {
                    'scalingo-app-name': {
                      value: 'pix-application-de-folie-recette',
                    },
                  },
                  'application-env': {
                    item: {
                      selected_option: {
                        text: {
                          text: 'recette',
                        },
                        value: 'recette',
                      },
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

          expect(slackCall.isDone()).to.be.true;
          expect(res.statusCode).to.equal(200);
          expect(JSON.parse(res.payload)).to.deep.equal({
            response_action: 'push',
            view: {
              title: {
                type: 'plain_text',
                text: 'Confirmation',
              },
              submit: {
                type: 'plain_text',
                text: '🚀 Go !',
              },
              callback_id: 'application-creation-confirmation',
              private_metadata:
                '{"applicationName":"pix-application-de-folie-recette","applicationEnvironment":"recette","userEmail":"john.doe@pix.fr"}',
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  text: {
                    type: 'mrkdwn',
                    text: "Vous vous apprêtez à créer l'application *pix-application-de-folie-recette* dans la région : *recette* et à inviter cet adresse email en tant que collaborateur : *john.doe@pix.fr*",
                  },
                  type: 'section',
                },
              ],
              type: 'modal',
            },
          });
        });
      });
    });
  });
});
