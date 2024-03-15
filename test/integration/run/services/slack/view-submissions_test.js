import slackViewSubmissions from '../../../../../run/services/slack/view-submissions';
import { expect, nock, createScalingoTokenNock } from '../../../../test-helper';

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
  });
});
