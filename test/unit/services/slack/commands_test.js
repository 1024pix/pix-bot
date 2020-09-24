const { describe, it } = require('mocha');
const axios = require('axios');
const { sinon } = require('../../test-helper');
const {
  createAndDeployPixSiteRelease,
  createAndDeployPixProRelease,
  createAndDeployPixUI,
  createAndDeployPixLCMS
} = require('../../../../lib/services/slack/commands');
const releasesServices = require('../../../../lib/services/releases');
const githubServices = require('../../../../lib/services/github');

describe('Services | Slack | Commands', () => {
  beforeEach(() => {
    // given
    sinon.stub(axios, 'post');
    sinon.stub(releasesServices, 'publishPixRepo').resolves();
    sinon.stub(releasesServices, 'deployPixRepo').resolves();
    sinon.stub(releasesServices, 'deployPixUI').resolves();
    sinon.stub(githubServices, 'getLatestReleaseTag').resolves('v1.0.0');
  });

  describe('#createAndDeployPixSiteRelease', () => {
    describe('when releaseType is set to minor', () => {
      beforeEach(async () => {
        // given
        const payload = { text: 'minor' };
        // when
        await createAndDeployPixSiteRelease(payload);
      });

      it('should publish a new release', () => {
        // then
        sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-site', 'minor');
      });

      it('should retrieve the last release tag from GitHub', () => {
        // then
        sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-site');
      });

      it('should deploy the release', () => {
        // then
        sinon.assert.calledWith(releasesServices.deployPixRepo, 'pix-site', 'pix-site', 'v1.0.0');
      });
    });

    describe('when releaseType is not set to a valid value', () => {
      it('should publish a new minor release', async () => {
        // given
        const payload = { text: '' };
        // when
        await createAndDeployPixSiteRelease(payload);
        // then
        sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-site', 'minor');
      });
    });

  });

  describe('#createAndDeployPixUI', () => {
    beforeEach(async () => {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixUI(payload);
    });

    it('should publish a new release', () => {
      // then
      sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-ui', 'minor');
    });

    it('should retrieve the last release tag from GitHub', () => {
      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-ui');
    });

    it('should deploy the release', () => {
      // then
      sinon.assert.calledWith(releasesServices.deployPixUI);
    });
  });

  describe('#createAndDeployPixLCMS', () => {
    beforeEach(async () => {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixLCMS(payload);
    });

    it('should publish a new release', () => {
      // then
      sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-editor', 'minor');
    });

    it('should retrieve the last release tag from GitHub', () => {
      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-editor');
    });

    it('should deploy the release', () => {
      // then
      sinon.assert.calledWith(releasesServices.deployPixRepo);
    });
  });
});
