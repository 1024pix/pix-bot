const { expect } = require('chai');
const server = require('../../lib/server');

describe('Scalingo Controller', () => {

  it('should return an HTTP 200 OK', async () => {
    //given
    const options = {
      method: 'POST',
      url: '/scalingo/webhook/deployment',
      headers: {}
    };

    //when
    const response = await server.inject(options);

    // then
    expect(response.statusCode).to.equal(200);
  });
});
