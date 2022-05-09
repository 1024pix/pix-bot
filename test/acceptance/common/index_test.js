const { expect } = require('../../test-helper');
const server = require('../../../server');
const { version } = require('../../../package.json');

describe('Acceptance | Common | Index', function() {
  describe('GET /', function() {
    it('responds with 200', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/'
      });
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.payload)).to.deep.equal({
        name: 'pix-bot',
        version,
        description: 'Pix Bot application'
      });
    });
  });

  describe('GET /slackviews', function() {
    it('responds with 200', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/slackviews'
      });
      expect(res.statusCode).to.equal(200);
    });
  });
});
