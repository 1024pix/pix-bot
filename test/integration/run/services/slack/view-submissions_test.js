import slackViewSubmissions from '../../../../../run/services/slack/view-submissions.js';
import { createScalingoTokenNock, expect, nock } from '../../../../test-helper.js';

describe('Integration | Run | Services | Slack | Commands', function () {
  describe('#submitCreateAppOnScalingoConfirmation', function () {
    it('creates a scalingo application', async function () {
      const payload = {
        user: { id: 'idslack' },
        view: {
          private_metadata:
            '{"applicationName": "foobar","applicationEnvironment": "recette", "userEmail": "foo@bar.fr"}',
        },
      };
      const expectedResponse = {
        response_action: 'clear',
      };

      const expectedBody = { app: { name: 'foobar' } };
      const expectedUpdateBody = {
        app: {
          force_https: true,
          router_logs: true,
        },
      };
      const expectedInviteCollaboratorBody = {
        collaborator: { email: 'foo@bar.fr' },
      };
      createScalingoTokenNock();
      nock(`https://scalingo.recette`)
        .post('/v1/apps', JSON.stringify(expectedBody))
        .reply(201, { app: { id: 1 } });
      nock(`https://scalingo.recette`)
        .patch('/v1/apps/1', JSON.stringify(expectedUpdateBody))
        .reply(200, { app: { name: 'foobar' } });
      nock(`https://scalingo.recette`)
        .post('/v1/apps/1/collaborators', JSON.stringify(expectedInviteCollaboratorBody))
        .reply(201, {
          collaborator: [
            {
              email: 'collaborator@example.com',
              id: '54101e25736f7563d5060000',
              status: 'pending',
              username: 'n/a',
              invitation_link:
                'https://my.scalingo.com/apps/collaboration?token=8415965b809c928c807dc99790e5745d97f05b8c',
              app_id: '5343eccd646173000a140000',
            },
          ],
        });

      const response = await slackViewSubmissions.submitCreateAppOnScalingoConfirmation(payload);

      expect(response).to.deep.equal(expectedResponse);
    });

    describe('when application has -production in its name', function () {
      function nockNotificationPlatforms() {
        nock(`https://scalingo.production`)
          .get('/v1/notification_platforms')
          .reply(200, {
            notification_platforms: [
              { id: 'slack-id', name: 'slack' },
              { id: 'webhook-id', name: 'webhook' },
            ],
          });
      }

      function nockEventTypes() {
        nock(`https://scalingo.production`)
          .get('/v1/event_types')
          .reply(200, {
            event_types: [
              { id: 'app_deployed-id', name: 'app_deployed' },
              { id: 'app_restarted-id', name: 'app_restarted' },
              { id: 'app_restarted-id', name: 'app_restarted' },
              { id: 'app_crashed-id', name: 'app_crashed' },
              { id: 'app_crashed_repeated-id', name: 'app_crashed_repeated' },
              { id: 'app_stopped-id', name: 'app_stopped' },
              { id: 'app_deleted-id', name: 'app_deleted' },
              { id: 'addon_provisioned-id', name: 'addon_provisioned' },
              { id: 'addon_resumed-id', name: 'addon_resumed' },
              { id: 'addon_suspended-id', name: 'addon_suspended' },
              { id: 'addon_plan_changed-id', name: 'addon_plan_changed' },
              { id: 'addon_db_upgraded-id', name: 'addon_db_upgraded' },
              { id: 'addon_deleted-id', name: 'addon_deleted' },
              { id: 'domain_added-id', name: 'domain_added' },
              { id: 'domain_edited-id', name: 'domain_edited' },
              { id: 'domain_removed-id', name: 'domain_removed' },
              { id: 'notifier_added-id', name: 'notifier_added' },
              { id: 'notifier_edited-id', name: 'notifier_edited' },
              { id: 'notifier_removed-id', name: 'notifier_removed' },
              { id: 'variable_added-id', name: 'variable_added' },
              { id: 'variable_edited-id', name: 'variable_edited' },
              { id: 'variable_bulk_edited-id', name: 'variable_bulk_edited' },
              { id: 'variable_removed-id', name: 'variable_removed' },
              { id: 'addon_updated-id', name: 'addon_updated' },
            ],
          });
      }

      it('creates a scalingo application', async function () {
        const payload = {
          user: { id: 'idslack' },
          view: {
            private_metadata:
              '{"applicationName": "pix-test-production","applicationEnvironment": "production", "userEmail": "foo@bar.fr"}',
          },
        };

        createScalingoTokenNock();

        nock(`https://scalingo.production`)
          .post('/v1/apps', JSON.stringify({ app: { name: 'pix-test-production' } }))
          .reply(201, { app: { id: 1 } });

        nock(`https://scalingo.production`)
          .patch(
            '/v1/apps/1',
            JSON.stringify({
              app: {
                force_https: true,
                router_logs: true,
              },
            }),
          )
          .reply(200, { app: { name: 'foobar' } });

        nock(`https://scalingo.production`)
          .post(
            '/v1/apps/1/collaborators',
            JSON.stringify({
              collaborator: { email: 'foo@bar.fr' },
            }),
          )
          .reply(201, {
            collaborator: [
              {
                email: 'collaborator@example.com',
                id: '54101e25736f7563d5060000',
                status: 'pending',
                username: 'n/a',
                invitation_link:
                  'https://my.scalingo.com/apps/collaboration?token=8415965b809c928c807dc99790e5745d97f05b8c',
                app_id: '5343eccd646173000a140000',
              },
            ],
          });

        nockNotificationPlatforms();
        nockEventTypes();

        nock(`https://scalingo.production`)
          .post(
            '/v1/apps/pix-test-production/notifiers',
            JSON.stringify({
              notifier: {
                platform_id: 'slack-id',
                name: 'Deploy on #tech-releases',
                active: true,
                selected_event_ids: ['app_deployed-id'],
                type_data: {
                  webhook_url: 'https://hooks.slack.com/services/techReleaseWebhookUrl',
                },
              },
            }),
          )
          .reply(201, {
            notifier: {
              id: 'deployment-notifier-id',
              name: 'Deploy on #tech-releases',
              type: 'slack',
              app: 'pix-test-production',
            },
          });

        nockNotificationPlatforms();
        nockEventTypes();

        nock(`https://scalingo.production`)
          .post(
            '/v1/apps/pix-test-production/notifiers',
            JSON.stringify({
              notifier: {
                platform_id: 'slack-id',
                name: 'Events logger on #alerte-pix-logs',
                active: true,
                selected_event_ids: [
                  'app_restarted-id',
                  'app_crashed-id',
                  'app_crashed_repeated-id',
                  'app_stopped-id',
                  'app_deleted-id',
                  'addon_provisioned-id',
                  'addon_resumed-id',
                  'addon_suspended-id',
                  'addon_plan_changed-id',
                  'addon_db_upgraded-id',
                  'addon_deleted-id',
                  'domain_added-id',
                  'domain_edited-id',
                  'domain_removed-id',
                  'notifier_added-id',
                  'notifier_edited-id',
                  'notifier_removed-id',
                  'variable_added-id',
                  'variable_edited-id',
                  'variable_bulk_edited-id',
                  'variable_removed-id',
                  'addon_updated-id',
                ],
                type_data: {
                  webhook_url: 'https://hooks.slack.com/services/alertPixLogsWebhookUrl',
                },
              },
            }),
          )
          .reply(201, {
            notifier: {
              id: 'alert-notifier-id',
              name: 'Events logger on #alerte-pix-logs',
              type: 'slack',
              app: 'pix-test-production',
            },
          });

        nock(`https://scalingo.production`)
          .post(
            '/v1/apps/pix-test-production/alerts',
            JSON.stringify({
              alert: {
                container_type: 'web',
                metric: '5XX',
                limit: 1,
                duration_before_trigger: 0,
                notifiers: ['alert-notifier-id'],
              },
            }),
          )
          .reply(201, { alert: { metric: '5XX' } });

        const response = await slackViewSubmissions.submitCreateAppOnScalingoConfirmation(payload);

        expect(response).to.deep.equal({
          response_action: 'clear',
        });
      });
    });
  });
});
