const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../common/services/logger');

describe('logger', function () {
  describe('when an message is passed', function () {
    it('should call injectedLogger with stringified message', function () {
      // given
      const injectedLogger = {
        info: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub(),
      };

      // when
      logger.info('message', injectedLogger);
      logger.warn('message', injectedLogger);
      logger.error('message', injectedLogger);

      // then
      expect(injectedLogger.info).to.have.been.calledOnceWithExactly('"message"');
      expect(injectedLogger.warn).to.have.been.calledOnceWithExactly('"message"');
      expect(injectedLogger.error).to.have.been.calledOnceWithExactly('"message"');
    });
  });
  describe('when an object is passed', function () {
    it('should call injectedLogger with stringified object', function () {
      // given
      const injectedLogger = {
        info: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub(),
      };

      // when
      logger.info({ foo: 'bar' }, injectedLogger);
      logger.warn({ foo: 'bar' }, injectedLogger);
      logger.error({ foo: 'bar' }, injectedLogger);

      // then
      expect(injectedLogger.info).to.have.been.calledOnceWithExactly('{"foo":"bar"}');
      expect(injectedLogger.warn).to.have.been.calledOnceWithExactly('{"foo":"bar"}');
      expect(injectedLogger.error).to.have.been.calledOnceWithExactly('{"foo":"bar"}');
    });
  });
});
