const scalingo = require('scalingo');

module.exports = {

  async getClient() {
    if (!this._client) {
      this._client = await scalingo.clientFromToken(process.env.SCALINGO_TOKEN, { apiUrl: process.env.SCALINGO_API_URL });
    }
    return this._client;
  },
};
