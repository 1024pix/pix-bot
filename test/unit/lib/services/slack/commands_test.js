const { describe, it } = require('mocha');
const axios = require('axios');
const { sinon } = require('../../../../test-helper');
const {
  createAndDeployPixDatawarehouse,
} = require('../../../../../common/services/slack/commands');
const releasesServices = require('../../../../../lib/services/releases');
const githubServices = require('../../../../../common/services/github');

describe('Services | Slack | Commands', () => {
  beforeEach(() => {
    // given
    sinon.stub(axios, 'post');
    sinon.stub(releasesServices, 'publishPixRepo').resolves();
    sinon.stub(releasesServices, 'deployPixRepo').resolves();
    sinon.stub(githubServices, 'getLatestReleaseTag').resolves('v1.0.0');
  });

  describe('#createAndDeployPixDatawarehouse', () => {
    beforeEach(async () => {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixDatawarehouse(payload);
    });

    it('should publish a new release', () => {
      // then
      sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-db-replication', 'minor');
    });

    it('should retrieve the last release tag from GitHub', () => {
      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-db-replication');
    });

    it('should deploy the release', () => {
      // then
      sinon.assert.calledWith(releasesServices.deployPixRepo);
    });
  });
});
