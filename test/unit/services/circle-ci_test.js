const { describe, it } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const circleCiService = require('../../../lib/services/circle-ci');

describe('#isDevGreen', function() {
  let axiosGetStub;
  const successWorkflowItem = { status: 'success' };
  const failWorkflowItem = { status: 'fail' };

  beforeEach(() => {
    const pipelineItem = { id: 'pipeline_id' };
    axiosGetStub = sinon.stub(axios, 'get');
    axiosGetStub.onFirstCall().resolves({ data: { items: [pipelineItem] } });
    axiosGetStub.onSecondCall().resolves({ data: { items: [successWorkflowItem]}});
  });

  afterEach(() => {
    axiosGetStub.restore();
  });

  it('should call Circle CI to get latest dev pipeline ID', async function() {
    // when
    await circleCiService.isDevGreen();

    // then
    sinon.assert.calledWith(axios.get, 'https://circleci.com/api/v2/project/gh%2F1024pix%2Fpix/pipeline', {
      params: { branch: 'dev' },
      headers: {
        Accept: 'application/json',
        'Circle-Token': 'Circle CI dummy token'
      }
    })
  });

  it('should call Circle CI to get latest pipeline workflow status', async function() {
    // when
    await circleCiService.isDevGreen();

    // then
    sinon.assert.calledWith(axios.get, 'https://circleci.com/api/v2/pipeline/pipeline_id/workflow', {
      headers: {
        Accept: 'application/json',
        'Circle-Token': 'Circle CI dummy token'
      }
    });
  });

  it('should return true when latest pipeline workflow status is `success`', async function() {
    // given
    axiosGetStub.onSecondCall().resolves({ data: { items: [successWorkflowItem] } });

    // when
    const isDevGreen = await circleCiService.isDevGreen();

    // then
    expect(isDevGreen).to.eql(true);
  });

  it('should return false when latest pipeline workflow status is `fail`', async function() {
    // given
    axiosGetStub.onSecondCall().resolves({ data: { items: [failWorkflowItem] } });

    // when
    const isDevGreen = await circleCiService.isDevGreen();

    // then
    expect(isDevGreen).to.eql(false);
  });

});

