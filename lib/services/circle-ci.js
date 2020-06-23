const axios = require('axios');
const { circleCi } = require('../config');

const headers = {
  Accept: 'application/json',
  'Circle-Token': circleCi.authorizationToken
};

async function _getDevPipelineId() {
  const { data } = await axios.get(`${circleCi.baseUrl}/project/${circleCi.projectSlug}/pipeline`, {
    params: { branch: 'dev' },
    headers
  });
  return data.items[0].id;
}

async function _getPipelineWorkflowStatus(pipelineId) {
  const { data } = await axios.get(`${circleCi.baseUrl}/pipeline/${pipelineId}/workflow`, { headers });
  return data.items[0].status;
}

module.exports = {
  async isDevGreen() {
    const pipelineId = await _getDevPipelineId();
    const workflowStatus = await _getPipelineWorkflowStatus(pipelineId);
    return workflowStatus === 'success';
  }
};
