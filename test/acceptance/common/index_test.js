const { expect, StatusCodes } = require('../../test-helper');
const server = require('../../../server');
const { version } = require('../../../package.json');

describe('Acceptance | Common | Index', function () {
  describe('on every route', function () {
    context('when an error is thrown', function () {
      it('should respond an INTERNAL_SERVER_ERROR (500) and a high-level message', async function () {
        // given
        server.route([
          {
            method: 'GET',
            path: '/throw-error',
            handler: () => {
              throw new Error('Some developer-oriented diagnostic message');
            },
          },
        ]);
        const response = await server.inject({
          method: 'GET',
          url: '/throw-error',
        });
        expect(response.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(response.result).to.not.equal('Some developer-oriented diagnostic message');
        expect(response.result).to.equal('An error occurred, please try again later');
      });
    });
  });

  describe('GET /', function () {
    it('responds with 200', async function () {
      const res = await server.inject({
        method: 'GET',
        url: '/',
      });
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.payload)).to.deep.equal({
        name: 'pix-bot',
        version,
        description: 'Pix Bot application',
      });
    });
  });

  describe('GET /slackviews', function () {
    it('responds with 200', async function () {
      const res = await server.inject({
        method: 'GET',
        url: '/slackviews',
      });
      expect(res.statusCode).to.equal(200);
    });
  });
});
