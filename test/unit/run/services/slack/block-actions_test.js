import { describe, it } from 'mocha';
import cdnService from '../../../../../run/services/cdn.js';
import slackService from '../../../../../common/services/slack/surfaces/messages/update-message.js';
import blockActions from '../../../../../run/services/slack/block-actions.js';
import { expect, sinon } from '../../../../test-helper.js';
import { AutomaticRule } from '../../../../../run/models/AutomaticRule.js';
import dayjs from 'dayjs';

describe('Unit | Run | Services | Slack | Block Actions', function () {
  let clock;
  let now;

  beforeEach(function () {
    now = new Date('2024-01-01');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#disableAutomaticRule', function () {
    it('should disable rule in CDN and update the slack message', async function () {
      // given
      sinon.stub(cdnService, 'disableRule').resolves();
      sinon.stub(slackService, 'updateMessage').resolves();

      const ip = '127.0.0.1';
      const ja3 = '9709730930';
      const date = dayjs(now);

      const payload = {
        message: {
          ts: '1735836582.877169',
          attachments: [
            {
              blocks: [
                { fields: [{ text: 'IP' }, { text: ip }] },
                { fields: [{ text: 'JA3' }, { text: ja3 }] },
                { elements: [{ text: `At ${date.format('DD/MM/YYYY HH:mm:ss')}` }] },
              ],
            },
          ],
        },
        actions: [
          {
            value:
              '[{"namespaceKey":"namespaceKey1","ruleId":"ruleId1"},{"namespaceKey":"namespaceKey2","ruleId":"ruleId2"}]',
          },
        ],
      };

      // when
      const result = await blockActions.disableAutomaticRule(payload);

      // then
      sinon.assert.calledWith(cdnService.disableRule, { namespaceKey: 'namespaceKey1', ruleId: 'ruleId1' });
      sinon.assert.calledWith(cdnService.disableRule, { namespaceKey: 'namespaceKey2', ruleId: 'ruleId2' });
      sinon.assert.calledWith(slackService.updateMessage, {
        ts: '1735836582.877169',
        ...new AutomaticRule({ ip, ja3, date }).getDeactivatedMessage(),
      });
      expect(result).to.equal('Automatic rule disabled.');
    });
  });
});
