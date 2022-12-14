const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../common/services/logger');

describe('logger', function () {
  describe('error', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger error with stringified message', function () {
        // given
        const injectedLogger = { error: sinon.stub() };

        // when
        logger.error('message', injectedLogger);

        // then
        expect(injectedLogger.error).to.have.been.calledOnceWithExactly('"message"');
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger error with stringified object', function () {
        // given
        const injectedLogger = { error: sinon.stub() };

        // when
        logger.error({ foo: 'bar' }, injectedLogger);

        // then
        expect(injectedLogger.error).to.have.been.calledOnceWithExactly('{"foo":"bar"}');
      });
    });
  });
});
