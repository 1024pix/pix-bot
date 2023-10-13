const { httpAgent } = require('../http-agent');

async function getPixApiVersion(injectedHttpAgent = httpAgent) {
  const apiUrl = 'https://api.pix.fr/api';
  const response = await injectedHttpAgent.get({ url: apiUrl });

  if (!response.isSuccessful) {
    throw new Error(`Couldn't get API version form ${apiUrl}`);
  }

  return response.data.version;
}

module.exports = {
  getPixApiVersion,
};
