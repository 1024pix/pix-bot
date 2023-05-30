const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../common/services/logger');

describe('logger', function () {
  describe('error', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger error', function () {
        // given
        const injectedLogger = { error: sinon.stub() };

        // when
        logger.error({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger);
        // then
        expect(injectedLogger.error.calledOnce).to.be.true;
        expect(injectedLogger.error.firstCall.args[0]).to.equal(
          '{"event":"toto","message":"titi","stack":"stack","level":"error"}'
        );
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger error with object in message', function () {
        // given
        const injectedLogger = { error: sinon.stub() };

        // when
        logger.error({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.error.calledOnce).to.be.true;
        expect(injectedLogger.error.firstCall.args[0]).to.equal(
          '{"event":"toto","message":"{\\"foo\\":\\"bar\\"}","stack":"stack","level":"error"}'
        );
      });
    });
  });
  describe('info', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger log', function () {
        // given
        const injectedLogger = { log: sinon.stub() };

        // when
        logger.info({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.log.calledOnce).to.be.true;
        expect(injectedLogger.log.firstCall.args[0]).to.equal(
          '{"event":"toto","message":"titi","stack":"stack","level":"info"}'
        );
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger log with object in message', function () {
        // given
        const injectedLogger = { log: sinon.stub() };

        // when
        logger.info({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.log.calledOnce).to.be.true;
        expect(injectedLogger.log.firstCall.args[0]).to.equal(
          '{"event":"toto","message":"{\\"foo\\":\\"bar\\"}","stack":"stack","level":"info"}'
        );
      });
    });
  });
  describe('warn', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger warn', function () {
        // given
        const injectedLogger = { warn: sinon.stub() };

        // when
        logger.warn({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.warn.calledOnce).to.be.true;
        expect(injectedLogger.warn.firstCall.args[0]).to.equal(
          '{"event":"toto","message":"titi","stack":"stack","level":"warn"}'
        );
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger warn with object in message', function () {
        // given
        const injectedLogger = { warn: sinon.stub() };

        // when
        logger.warn({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.warn.calledOnce).to.be.true;
        expect(injectedLogger.warn.firstCall.args[0]).to.equal(
          '{"event":"toto","message":"{\\"foo\\":\\"bar\\"}","stack":"stack","level":"warn"}'
        );
      });
    });
  });
});
