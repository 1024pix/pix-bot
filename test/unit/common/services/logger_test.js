const { expect, sinon } = require('../../../test-helper');
const logger = require('../../../../common/services/logger');

describe('logger', function () {
  const injectedLoggerFunction = {
    error: 'error',
    info: 'log',
    warn: 'warn',
    ok: 'ok',
  };

  ['error', 'info', 'warn', 'ok'].forEach((level) => {
    describe(level, function () {
      describe('when an message is passed', function () {
        it(`should call injectedLogger ${level}`, function () {
          // given
          let injectedLogger = [];
          const functionToStub = injectedLoggerFunction[level];
          injectedLogger[functionToStub] = sinon.stub();

          // when
          logger[level]({ event: 'toto', message: 'titi', stack: 'stack' }, injectedLogger, true);
          // then
          expect(injectedLogger[functionToStub].calledOnce).to.be.true;
          expect(injectedLogger[functionToStub].firstCall.args[0]).to.equal(
            `{"event":"toto","message":"titi","stack":"stack","level":"${level}"}`,
          );
        });
      });
      describe('when an object is passed', function () {
        it(`should call injectedLogger ${level} with object in message`, function () {
          // given
          let injectedLogger = [];
          const functionToStub = injectedLoggerFunction[level];
          injectedLogger[functionToStub] = sinon.stub();

          // when
          logger[level]({ event: 'toto', message: { foo: 'bar' }, stack: 'stack' }, injectedLogger, true);

          // then
          expect(injectedLogger[functionToStub].calledOnce).to.be.true;
          expect(injectedLogger[functionToStub].firstCall.args[0]).to.equal(
            `{"event":"toto","message":"{\\"foo\\":\\"bar\\"}","stack":"stack","level":"${level}"}`,
          );
        });
      });
    });
  });
});
