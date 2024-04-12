import { logger } from '../../../../common/services/logger.js';
import { expect, sinon } from '../../../test-helper.js';

describe('logger', function () {
  const injectedLoggerFunction = {
    error: 'error',
    info: 'log',
    warn: 'warn',
  };

  [logger.error, logger.info, logger.warn].forEach((level) => {
    describe(`${level}`, function () {
      describe('when an message is passed', function () {
        it(`should call injectedLogger ${level}`, function () {
          // given
          const injectedLogger = [];
          const functionToStub = injectedLoggerFunction[level];
          injectedLogger[functionToStub] = sinon.stub();
          const data = { ctx: 'context', meta: 'metadata' };

          // when
          level({ event: 'toto', message: 'titi', stack: 'stack', data }, injectedLogger, true);
          // then
          expect(injectedLogger[functionToStub].calledOnce).to.be.true;
          expect(injectedLogger[functionToStub].firstCall.args[0]).to.equal(
            `{"event":"toto","message":"titi","stack":"stack","level":"${level}","data":{"ctx":"context","meta":"metadata"}}`,
          );
        });
      });

      describe('when an object is passed', function () {
        it(`should call injectedLogger ${level} with object in message`, function () {
          // given
          const injectedLogger = [];
          const functionToStub = injectedLoggerFunction[level];
          injectedLogger[functionToStub] = sinon.stub();
          const data = { ctx: 'context', meta: 'metadata' };

          // when
          level({ event: 'toto', message: { foo: 'bar' }, stack: 'stack', data }, injectedLogger, true);

          // then
          expect(injectedLogger[functionToStub].calledOnce).to.be.true;
          expect(injectedLogger[functionToStub].firstCall.args[0]).to.equal(
            `{"event":"toto","message":"{\\"foo\\":\\"bar\\"}","stack":"stack","level":"${level}","data":{"ctx":"context","meta":"metadata"}}`,
          );
        });
      });
    });
  });
});
