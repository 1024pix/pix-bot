const { postMessage } = require('../../../../../../../common/services/slack/surfaces/messages/post-message');
const { expect, sinon } = require('../../../../../../test-helper');
const config = require('../../../../../../../config');

describe('Unit | Common | Services | Slack | Surfaces | Messages | Post-Message', function () {
  describe('#postMessage', function () {
    it('should make a call to slack API post-message endpoint', async function () {
      //given
      const messageToSend = 'test message';
      const destinationChannel = '#mychannel';
      sinon.stub(config.slack, 'botToken').value('faketoken');
      const httpAgent = { post: sinon.stub() };
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
  });
});
