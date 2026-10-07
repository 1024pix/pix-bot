import { catchErr, expect } from '../../../test-helper.js';
import scalingoController from '../../../../build/controllers/scalingo.js';

describe('Unit | Controller | Scalingo', function () {
  describe('#deployEndpoint', function () {
    it('should throw when token is invalid', async function () {
      const request = {
        headers: {
          authorization: 'Invalid token',
        },
      };

      // when
      const error = await catchErr(scalingoController.deployEndpoint)(request);

      // then
      expect(error.message).to.equal('Token is missing or is incorrect');
    });
  });

  describe('#reviewAppDeployEndpoint', function () {
    it('should throw when token is invalid', async function () {
      const request = {
        headers: {
          authorization: 'Invalid token',
        },
      };

      // when
      const error = await catchErr(scalingoController.reviewAppDeployEndpoint)(request);

      // then
      expect(error.message).to.equal('Token is missing or is incorrect');
    });
  });
});
