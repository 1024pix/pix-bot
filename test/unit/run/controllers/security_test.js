import { expect } from '../../../test-helper.js';
import securityController from '../../../../run/controllers/security.js';

describe('Unit | Run | Controller | Security', function () {
  describe('#blockAccessOnBaleen', function () {
    describe('when authorization header does not match', function () {
      it('should return a 401 Unauthorized', async function () {
        // given
        const request = {
          headers: {
            authorization: 'wrong-token',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(401);
        expect(response.message).to.equal('Token is missing or is incorrect');
      });
    });

    describe('when there is no body attribute', function () {
      it('should return a 400 Bad Request', async function () {
        // given
        const request = {
          headers: {
            authorization: 'token',
          },
          payload: {
            monitorId: '1234',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(400);
        expect(response.message).to.equal('Inconsistent payload : {"monitorId":"1234"}.');
      });
    });

    describe('when the body is malformed', function () {
      it('should return a 400 Bad Request', async function () {
        // given
        const request = {
          headers: {
            authorization: 'token',
          },
          payload: {
            monitorId: '1234',
            body: 'malformed body',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(400);
        expect(response.message).to.equal('Inconsistent payload : malformed body.');
      });
    });

    describe('when the ip parameter is absent', function () {
      it('should return a 400 Bad Request', async function () {
        // given
        const request = {
          headers: {
            authorization: 'token',
          },
          payload: {
            monitorId: '1234',
            body: '>>{"ja3":"12345"}<<',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(400);
        expect(response.message).to.equal('IP is mandatory.');
      });
    });

    describe('when the ip parameter is empty', function () {
      it('should return a 400 Bad Request', async function () {
        // given
        const request = {
          headers: {
            authorization: 'token',
          },
          payload: {
            monitorId: '1234',
            body: '>>{"ip": "","ja3":"12345"}<<',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(400);
        expect(response.message).to.equal('IP is mandatory.');
      });
    });

    describe('when the ja3 parameter is absent', function () {
      it('should return a 400 Bad Request', async function () {
        // given
        const request = {
          headers: {
            authorization: 'token',
          },
          payload: {
            monitorId: '1234',
            body: '>>{"ip":"127.0.0.1"}<<',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(400);
        expect(response.message).to.equal('JA3 is mandatory.');
      });
    });

    describe('when the ja3 parameter is empty', function () {
      it('should return a 400 Bad Request', async function () {
        // given
        const request = {
          headers: {
            authorization: 'token',
          },
          payload: {
            monitorId: '1234',
            body: '>>{"ip": "127.0.0.1","ja3":""}<<',
          },
        };

        // when
        const response = await securityController.blockAccessOnBaleen(request);

        // then
        expect(response.output.statusCode).to.equal(400);
        expect(response.message).to.equal('JA3 is mandatory.');
      });
    });
  });
});
