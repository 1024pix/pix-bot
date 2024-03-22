import postMessage from '../../../../../../../common/services/slack/surfaces/messages/post-message';
import { expect, sinon } from '../../../../../../test-helper';
import config from '../../../../../../../config.js';
import * as logger from '../../../../../../../common/services/logger';

describe('Unit | Common | Services | Slack | Surfaces | Messages | Post-Message', function () {
  describe('#postMessage', function () {
    it('should make a call to slack API post-message endpoint', async function () {
      //given
      const messageToSend = 'test message';
      const destinationChannel = '#mychannel';
      sinon.stub(config.slack, 'botToken').value('faketoken');
      const httpAgent = { post: sinon.stub().resolves({ isSuccessful: true, data: { ok: true } }) };
      //when
      await postMessage({
        message: messageToSend,
        attachments: {},
        channel: destinationChannel,
        injectedHttpAgent: httpAgent,
      });

      //then
      expect(httpAgent.post).to.have.been.calledOnceWith({
        url: 'https://slack.com/api/chat.postMessage',
        payload: { channel: '#mychannel', text: 'test message', attachments: {} },
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
      sinon.stub(config.slack, 'botToken').value('faketoken');
      const errorLoggerStub = sinon.stub(logger, 'error');
      const slackErrorResponse = { isSuccessful: true, data: { ok: false, error: 'not_in_channel' } };
      const httpAgent = { post: sinon.stub().resolves(slackErrorResponse) };
      //when
      await postMessage({
        message: messageToSend,
        attachments: {},
        channel: destinationChannel,
        injectedHttpAgent: httpAgent,
      });

      //then
      expect(httpAgent.post).to.have.been.calledOnceWith({
        url: 'https://slack.com/api/chat.postMessage',
        payload: { channel: '#mychannel', text: 'test message', attachments: {} },
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer faketoken',
        },
      });
      expect(errorLoggerStub).to.have.been.calledOnceWith({
        event: 'slack-post-message',
        message: 'Slack error occured while sending message : not_in_channel',
        stack: 'Payload for error was {"channel":"#mychannel","text":"test message","attachments":{}}',
      });
    });
  });
});
