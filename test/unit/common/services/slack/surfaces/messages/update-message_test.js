import { logger } from '../../../../../../../common/services/logger.js';
import slackPostMessageService from '../../../../../../../common/services/slack/surfaces/messages/update-message.js';
import { config } from '../../../../../../../config.js';
import { expect, sinon } from '../../../../../../test-helper.js';

describe('Unit | Common | Services | Slack | Surfaces | Messages | Update-Message', function () {
  describe('updateMessage', function () {
    it('should make a call to slack API update-message endpoint', async function () {
      //given
      const messageToSend = 'test message';
      const destinationChannel = '#mychannel';
      const messageTimestamp = '1735836582.877169';
      sinon.stub(config.slack, 'botToken').value('faketoken');
      const httpAgent = { post: sinon.stub().resolves({ isSuccessful: true, data: { ok: true } }) };
      //when
      await slackPostMessageService.updateMessage({
        message: messageToSend,
        ts: messageTimestamp,
        attachments: {},
        channel: destinationChannel,
        injectedHttpAgent: httpAgent,
      });

      //then
      expect(httpAgent.post).to.have.been.calledOnceWith({
        url: 'https://slack.com/api/chat.update',
        payload: {
          channel: '#mychannel',
          ts: '1735836582.877169',
          as_user: true,
          text: 'test message',
          attachments: {},
        },
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer faketoken',
        },
      });
    });

    it('should log slack API errors', async function () {
      //given
      const messageToSend = 'test message';
      const destinationChannel = '#mychannel';
      const messageTimestamp = '1735836582.877169';
      sinon.stub(config.slack, 'botToken').value('faketoken');
      const errorLoggerStub = sinon.stub(logger, 'error');
      const slackErrorResponse = { isSuccessful: true, data: { ok: false, error: 'not_in_channel' } };
      const httpAgent = { post: sinon.stub().resolves(slackErrorResponse) };

      //when
      await slackPostMessageService.updateMessage({
        message: messageToSend,
        ts: messageTimestamp,
        attachments: {},
        channel: destinationChannel,
        injectedHttpAgent: httpAgent,
      });

      //then
      expect(httpAgent.post).to.have.been.calledOnceWith({
        url: 'https://slack.com/api/chat.update',
        payload: {
          channel: '#mychannel',
          ts: '1735836582.877169',
          as_user: true,
          text: 'test message',
          attachments: {},
        },
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer faketoken',
        },
      });
      expect(errorLoggerStub).to.have.been.calledOnceWith({
        event: 'slack-update-message',
        message: 'Slack error occurred while sending message : not_in_channel',
        stack: `Payload for error was {"channel":"#mychannel","ts":"1735836582.877169","as_user":true,"text":"test message","attachments":{}}`,
      });
    });
  });
});
