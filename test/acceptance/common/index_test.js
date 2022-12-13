const { expect, StatusCodes } = require('../../test-helper');
const server = require('../../../server');
const { version } = require('../../../package.json');

describe('Acceptance | Common | Index', function () {
  describe('on every route', function () {
    context('when an error is thrown', function () {
      it('should respond an INTERNAL_SERVER_ERROR (500)', async function () {
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
        expect(response.result.message).to.equal('An internal server error occurred');
      });
    });
  });

  it('should respond NOT_FOUND (404)', async function () {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/should-not-exist',
    });
    expect(statusCode).to.equal(StatusCodes.NOT_FOUND);
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
        description: 'Automating development actions',
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
