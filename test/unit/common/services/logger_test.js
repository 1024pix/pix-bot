const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../common/services/logger');

describe('logger', function () {
  describe('error', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger error with stringified message', function () {
        // given
        const injectedLogger = { error: sinon.stub() };

        // when
        logger.error({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.error.calledOnce).to.be.true;
        expect(injectedLogger.error.firstCall.args[0]).to.deep.equal({
          level: 'error',
          event: 'toto',
          message: 'titi',
          stack: 'stack',
        });
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger error with stringified object', function () {
        // given
        const injectedLogger = { error: sinon.stub() };

        // when
        logger.error({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.error.calledOnce).to.be.true;
        expect(injectedLogger.error.firstCall.args[0]).to.deep.equal({
          level: 'error',
          event: 'toto',
          message: JSON.stringify({ foo: 'bar' }),
          stack: 'stack',
        });
      });
    });
  });
  describe('info', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger log with stringified message', function () {
        // given
        const injectedLogger = { log: sinon.stub() };

        // when
        logger.info({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.log.calledOnce).to.be.true;
        expect(injectedLogger.log.firstCall.args[0]).to.deep.equal({
          level: 'info',
          event: 'toto',
          message: 'titi',
          stack: 'stack',
        });
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger error with stringified object', function () {
        // given
        const injectedLogger = { log: sinon.stub() };

        // when
        logger.info({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.log.calledOnce).to.be.true;
        expect(injectedLogger.log.firstCall.args[0]).to.deep.equal({
          level: 'info',
          event: 'toto',
          message: JSON.stringify({ foo: 'bar' }),
          stack: 'stack',
        });
      });
    });
  });
  describe('warn', function () {
    describe('when an message is passed', function () {
      it('should call injectedLogger log with stringified message', function () {
        // given
        const injectedLogger = { warn: sinon.stub() };

        // when
        logger.warn({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.warn.calledOnce).to.be.true;
        expect(injectedLogger.warn.firstCall.args[0]).to.deep.equal({
          level: 'warn',
          event: 'toto',
          message: 'titi',
          stack: 'stack',
        });
      });
    });
    describe('when an object is passed', function () {
      it('should call injectedLogger error with stringified object', function () {
        // given
        const injectedLogger = { warn: sinon.stub() };

        // when
        logger.warn({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger);

        // then
        expect(injectedLogger.warn.calledOnce).to.be.true;
        expect(injectedLogger.warn.firstCall.args[0]).to.deep.equal({
          level: 'warn',
          event: 'toto',
          message: JSON.stringify({ foo: 'bar' }),
          stack: 'stack',
        });
      });
    });
  });
});
