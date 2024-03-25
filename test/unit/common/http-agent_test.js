import { expect, sinon } from '../../test-helper.js';
import axios from 'axios';
import { httpAgent } from '../../../common/http-agent.js';

const { post } = httpAgent;

describe('Unit | Common | http-agent', function () {
  describe('#post', function () {
    context('when successful', function () {
      it('should return the response status and success from the http call ', async function () {
        // given
        const url = 'someUrl';
        const payload = 'somePayload';
        const headers = { a: 'someHeaderInfo' };
        const axiosResponse = {
          data: 'data',
          status: 200,
        };
        sinon
          .stub(axios, 'post')
          .withArgs(url, payload, {
            headers,
          })
          .resolves(axiosResponse);

        // when
        const actualResponse = await post({ url, payload, headers });

        // then
        expect(actualResponse).to.deep.equal({
          isSuccessful: true,
          code: 200,
          data: 'data',
        });
      });
    });
    context('when an error occurs', function () {
      context('when error.response exists', function () {
        it('should return statusCode and response', async function () {
          // given
          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };
          const axiosError = {
            response: {
              data: { a: '1', b: '2' },
              status: 400,
            },
          };
          sinon.stub(axios, 'post').withArgs(url, payload, { headers }).rejects(axiosError);

          // when
          const response = await post({ url, payload, headers });

          // then
          expect(response).to.deep.equal({
            isSuccessful: false,
            code: 400,
            data: { a: '1', b: '2' },
          });
        });
      });
      context('when error.response does not exists', function () {
        it('should return the error message', async function () {
          // given
          const url = 'someUrl';
          const payload = 'somePayload';
          const headers = { a: 'someHeaderInfo' };
          const axiosError = new Error('error message');
          sinon.stub(axios, 'post').withArgs(url, payload, { headers }).rejects(axiosError);

          // when
          const actualResponse = await post({ url, payload, headers });

          // then
          expect(actualResponse).to.deep.equal({
            code: null,
            data: 'error message',
            isSuccessful: false,
          });
        });
      });
    });
  });
});
