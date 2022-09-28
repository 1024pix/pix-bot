const axios = require('axios');
const config = require('../../config');

async function login() {
  const params = {
    data: {
      username: config.PIX_METABASE_SERVICE_USER,
      password: config.PIX_METABASE_SERVICE_PASSWORD,
    },
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await axios.post(`https://${config.PIX_METABASE_HOST}/api/session`, params.data, params.headers);
  return response.data.id;
}

async function getDashboard({ dashboardId, sessionId }) {
  const params = {
    headers: { 'Content-Type': 'application/json', 'X-Metabase-Session': sessionId },
  };
  const response = await axios.get(`https://${config.PIX_METABASE_HOST}/api/dashboard/${dashboardId}`, params);
  return response;
}
module.exports = {
  login,
  getDashboard,
};
