const { describe, it } = require('mocha');
const axios = require('axios');
const { sinon } = require('../../test-helper');
const { createAndDeployPixSiteRelease, createAndDeployPixProRelease } = require('../../../../lib/services/slack/commands');
const releasesServices = require('../../../../lib/services/releases');
const githubServices = require('../../../../lib/services/github');

describe('Services | Slack | Commands', () => {
  beforeEach(() => {
    // given
    sinon.stub(axios, 'post');
    sinon.stub(releasesServices, 'publishPixSite').resolves();
    sinon.stub(releasesServices, 'deployPixSite').resolves();
    sinon.stub(githubServices, 'getLatestReleaseTag').resolves('v1.0.0');
  });

  describe('#createAndDeployPixSiteRelease', () => {
    beforeEach(async () => {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixSiteRelease(payload);
    });

    it('should publish a new release', () => {
      // then
      sinon.assert.calledWith(releasesServices.publishPixSite, 'pix-site', 'minor');
    });

    it('should retrieve the last release tag from GitHub', () => {
      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-site');
    });

    it('should deploy the release', () => {
      // then
      sinon.assert.calledWith(releasesServices.deployPixSite, 'pix-site', 'pix-site', 'v1.0.0');
    });
  });

  describe('#createAndDeployPixProRelease', () => {
    beforeEach(async () => {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixProRelease(payload);
    });

    it('should publish a new release', () => {
      // then
      sinon.assert.calledWith(releasesServices.publishPixSite, 'pix-site-pro', 'minor');
    });

    it('should retrieve the last release tag from GitHub', () => {
      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-site-pro');
    });

    it('should deploy the release', () => {
      // then
      sinon.assert.calledWith(releasesServices.deployPixSite, 'pix-site-pro', 'pix-pro', 'v1.0.0');
    });
  });
});
