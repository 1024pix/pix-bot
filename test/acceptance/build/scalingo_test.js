const { expect, StatusCodes, nock, sinon } = require('../../test-helper');
const server = require('../../../server');
const logger = require('../../../common/services/logger');

describe('Acceptance | Build | Scalingo', function () {
  describe('POST build/scalingo/deploy-endpoint', function () {
    describe('when the build has failed', function () {
      it('should post a message on slack and log a message', async function () {
        // given
        const payload = { app_name: 'application', type_data: { status: 'build-error' } };
        const messageNock = nock('https://slack.com').post('/api/chat.postMessage').reply(StatusCodes.OK, { ok: true });
        const loggerInfoStub = sinon.stub(logger, 'info');

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/deploy-endpoint',
          payload,
        });

        // then
        expect(messageNock).to.have.been.requested;
        expect(response.statusCode).to.equal(StatusCodes.OK);
        expect(response.payload).to.equal('Slack error notification sent');
        expect(loggerInfoStub.calledThrice).to.be.true;
        expect(loggerInfoStub.firstCall.args[0]).to.equal('Scalingo request received');
        expect(loggerInfoStub.secondCall.args[0]).to.equal('Failed deployment on the application app');
        expect(loggerInfoStub.thirdCall.args[0]).to.equal('Slack error notification sent');
      });
    });
    describe('when the build has succeeded', function () {
      it('should return OK (200) and log a message', async function () {
        // given
        const payload = { type_data: { status: 'succeeded' } };
        const loggerInfoStub = sinon.stub(logger, 'info');

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/build/scalingo/deploy-endpoint',
          payload,
        });

        // then
        expect(response.statusCode).to.equal(StatusCodes.OK);
        expect(response.payload).to.equal('Slack error notification not sent');
        expect(loggerInfoStub).to.have.been.calledOnceWithExactly('Scalingo request received');
      });
    });
  });
});
