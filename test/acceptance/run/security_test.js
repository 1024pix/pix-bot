import { config } from '../../../config.js';
import server from '../../../server.js';
import { expect, nock, sinon } from '../../test-helper.js';

describe('Acceptance | Run | Security', function () {
  let now;
  let clock;

  beforeEach(function () {
    now = new Date('2024-01-01');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('POST /security/block-access-on-baleen-from-datadog', function () {
    it('responds with 200', async function () {
      // given
      const namespace = 'Pix_Namespace';
      const namespaceKey = 'namespace-key1';
      const monitorId = '1234';
      const ip = '127.0.0.1';
      const ja3 = '9709730930';
      const addedRuleId = 'aa1c6158-9512-4e56-a93e-cc8c4de9bc23';

      nock('https://console.baleen.cloud/api', {
        reqheaders: {
          'X-Api-Key': config.baleen.pat,
          'Content-type': 'application/json',
        },
      })
        .get('/account')
        .reply(200, {
          namespaces: {
            'namespace-key2': 'Test2',
            'namespace-key1': namespace,
          },
        });

      nock('https://console.baleen.cloud/api', {
        reqheaders: {
          'X-Api-Key': config.baleen.pat,
          'Content-type': 'application/json',
          Cookie: `baleen-namespace=${namespaceKey}`,
        },
      })
        .post('/configs/custom-static-rules', {
          category: 'block',
          name: `Blocage ip: ${ip} ja3: ${ja3}`,
          description: `Blocage automatique depuis le monitor Datadog ${monitorId}`,
          enabled: true,
          labels: ['automatic-rule'],
          conditions: [
            [
              { type: 'ip', operator: 'match', value: ip },
              { type: 'ja3', operator: 'equals', value: ja3 },
            ],
          ],
        })
        .reply(200, { id: addedRuleId });

      nock('https://slack.com', {
        reqheaders: {
          'content-type': 'application/json',
          authorization: `Bearer ${config.slack.botToken}`,
        },
      })
        .post('/api/chat.postMessage', {
          channel: `#${config.slack.blockedAccessesChannel}`,
          text: 'Règle de blocage mise en place sur Baleen.',
          attachments: [
            {
              color: '#106c1f',
              blocks: [
                {
                  fields: [
                    {
                      text: 'IP',
                      type: 'mrkdwn',
                    },
                    {
                      text: `${ip}`,
                      type: 'mrkdwn',
                    },
                  ],
                  type: 'section',
                },
                {
                  fields: [
                    {
                      text: 'JA3',
                      type: 'mrkdwn',
                    },
                    {
                      text: `${ja3}`,
                      type: 'mrkdwn',
                    },
                  ],
                  type: 'section',
                },
                {
                  elements: [
                    {
                      text: `At ${now.toLocaleString()}`,
                      type: 'mrkdwn',
                    },
                  ],
                  type: 'context',
                },
                {
                  type: 'divider',
                },
                {
                  elements: [
                    {
                      text: {
                        type: 'plain_text',
                        text: 'Désactiver',
                      },
                      action_id: 'disable-automatic-rule',
                      style: 'danger',
                      type: 'button',
                      value: '[{"namespaceKey":"namespace-key1","ruleId":"aa1c6158-9512-4e56-a93e-cc8c4de9bc23"}]',
                    },
                  ],
                  type: 'actions',
                },
              ],
              fallback: 'Règle de blocage mise en place sur Baleen.',
            },
          ],
        })
        .reply(200, {
          ok: true,
        });

      // when
      const res = await server.inject({
        method: 'POST',
        url: '/security/block-access-on-baleen-from-datadog',
        headers: {
          Authorization: 'token',
        },
        payload: {
          monitorId,
          body: `>>{"ip":"${ip}","ja3":"${ja3}"}<<`,
        },
      });

      expect(res.statusCode).to.equal(200);
      expect(res.result).to.equal(`Règles de blocage ${addedRuleId} mises en place.`);
      expect(nock.isDone()).to.be.true;
    });
  });
});
