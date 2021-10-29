const { describe, it } = require('mocha');
const { expect } = require('chai');
const axios = require('axios');
const { catchErr, sinon } = require('../../../../test-helper');
const {
  createAndDeployPixLCMS,
  createAndDeployPixUI,
  createEmberTestingLibraryRelease,
  createAndDeployPixSiteRelease,
  createAndDeployPixDatawarehouse,
  createAndDeployPixBotRelease,
  getAndDeployLastVersion,
} = require('../../../../../run/services/slack/commands');
const releasesServices = require('../../../../../common/services/releases');
const githubServices = require('../../../../../common/services/github');
const ScalingoClient = require('../../../../../common/services/scalingo-client');

describe('Services | Slack | Commands', () => {
  beforeEach(() => {
    // given
    sinon.stub(axios, 'post');
    sinon.stub(releasesServices, 'deployPixRepo').resolves();
    sinon.stub(releasesServices, 'publishPixRepo').resolves();
    sinon.stub(githubServices, 'getLatestReleaseTag').resolves('v1.0.0');
  });

  describe('#createAndDeployPixSiteRelease', () => {
    describe('when releaseType is set to minor', () => {
      beforeEach(async () => {
        // given
        const payload = { text: 'minor', response_url: 'http://example.net/callback' };
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

      it('should deploy the release for pix-site and pix-pro', () => {
        // then
        sinon.assert.calledWith(releasesServices.deployPixRepo, 'pix-site', 'pix-site', 'v1.0.0');
        sinon.assert.calledWith(releasesServices.deployPixRepo, 'pix-site', 'pix-pro', 'v1.0.0');
      });

      it('should inform the user of the progress', () => {
        sinon.assert.calledWith(axios.post, 'http://example.net/callback', { text: 'Le script de déploiement de la release \'v1.0.0\' pour pix-site, pix-pro en production s\'est déroulé avec succès. En attente de l\'installation des applications sur Scalingo…' });
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

    describe('when something fails', () => {
      it('should inform the user', async () => {
        // given
        const payload = { response_url: 'http://example.net/callback' };
        releasesServices.publishPixRepo.rejects();
        // when
        await createAndDeployPixSiteRelease(payload);
        // then
        sinon.assert.calledWith(axios.post, 'http://example.net/callback', { text: 'Erreur lors du déploiement de pix-site, pix-pro en production.' });
      });
    });
  });

  describe('#createAndDeployPixUI', () => {

    it('should publish a new release', async () => {
      // given
      const payload = { text: 'minor' };

      // when
      await createAndDeployPixUI(payload);

      // then
      sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-ui', 'minor');
    });

    it('should retrieve the last release tag from GitHub', async () => {
      // given
      const payload = { text: 'minor' };

      // when
      await createAndDeployPixUI(payload);

      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-ui');
    });

    it('should stop release if no version is given', async () => {
      // given
      const payload = { text: '' };

      // when
      const response = await catchErr(createAndDeployPixUI)(payload);

      // then
      expect(response).to.be.instanceOf(Error);
    });
  });

  describe('#createEmberTestingLibraryRelease', () => {

    it('should publish a new release', async () => {
      // given
      const payload = { text: 'minor' };

      // when
      await createEmberTestingLibraryRelease(payload);

      // then
      sinon.assert.calledWith(releasesServices.publishPixRepo, 'ember-testing-library', 'minor');
    });

    it('should retrieve the last release tag from GitHub', async () => {
      // given
      const payload = { text: 'minor' };

      // when
      await createEmberTestingLibraryRelease(payload);

      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'ember-testing-library');
    });

    it('should stop release if no version is given', async () => {
      // given
      const payload = { text: '' };

      // when
      const response = await catchErr(createEmberTestingLibraryRelease)(payload);

      // then
      expect(response).to.be.instanceOf(Error);
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

  describe('#createAndDeployPixBotRelease', () => {
    let client;
    beforeEach(async () => {
      // given
      client = { deployFromArchive: sinon.spy() };
      sinon.stub(ScalingoClient, 'getInstance').resolves(client);
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixBotRelease(payload);
    });

    it('should publish a new release', () => {
      // then
      sinon.assert.calledWith(releasesServices.publishPixRepo, 'pix-bot', 'minor');
    });

    it('should retrieve the last release tag from GitHub', () => {
      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'pix-bot');
    });

    it('should deploy the release for pix-bot-build', () => {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-bot-build');
    });

    it('should deploy the release for pix-bot-run', () => {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-bot-run');
    });
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

  describe('#getAndDeployLastVersion', () => {
    it('should redeploy last version of an app', async () => {
      // given
      const appName = 'pix-admin-integration';

      // when
      await getAndDeployLastVersion({ appName });

      // then
      sinon.assert.calledWith(releasesServices.deployPixRepo, 'pix', 'pix-admin', 'v1.0.0', 'integration');
    });

    it('should throw an error if appName is incorrect', async () => {
      // given
      const appName = 'pix-admin';

      // when
      const response = await catchErr(getAndDeployLastVersion)({ appName });

      // then
      expect(response).to.be.instanceOf(Error);
    });

    it('should throw an error if appName is not from pix repo', async () => {
      // given
      const appName = 'pix-site-production';

      // when
      const response = await catchErr(getAndDeployLastVersion)({ appName });

      // then
      expect(response).to.be.instanceOf(Error);
    });
  });
});
