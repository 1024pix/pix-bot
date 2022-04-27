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
    });
  });
});
