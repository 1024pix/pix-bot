const { describe, it } = require('mocha');
const axios = require('axios');
const { sinon } = require('../../test-helper');
const { createAndDeployPixSiteRelease } = require('../../../../lib/services/slack/commands');
const releasesServices = require('../../../../lib/services/releases');
const githubServices = require('../../../../lib/services/github');

describe('Services | Slack | Commands', () => {
  beforeEach(async () => {
    // given
    sinon.stub(axios, 'post');
    sinon.stub(releasesServices, 'publishPixSite').resolves();
    sinon.stub(releasesServices, 'deployPixSite').resolves();
    sinon.stub(githubServices, 'getLatestReleaseTag').resolves('v1.0.0');

    const payload = { text: 'minor' };

    // when
    await createAndDeployPixSiteRelease(payload);
  })

  it('should publish a new release', () => {
    // then
    sinon.assert.calledWith(releasesServices.publishPixSite, 'minor');
  });

  it('should retrieve the last release tag from GitHub', () => {
    // then
    sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-site');
  });

  it('should deploy the release', () => {
    // then
    sinon.assert.calledWith(releasesServices.deployPixSite, 'v1.0.0');
  });
})