import axios from 'axios';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import githubServices from '../../../../../common/services/github.js';
import releasesService from '../../../../../common/services/releases.js';
import ScalingoClient from '../../../../../common/services/scalingo-client.js';
import {
  createAndDeployDbStats,
  createAndDeployEmberTestingLibrary,
  createAndDeployPixAPIData,
  createAndDeployPixBotRelease,
  createAndDeployPixDatawarehouse,
  createAndDeployPixLCMS,
  createAndDeployPixSiteRelease,
  createAndDeployPixTutosRelease,
  createAndDeployPixUI,
  getAndDeployLastVersion,
} from '../../../../../run/services/slack/commands.js';
import { catchErr, sinon } from '../../../../test-helper.js';

describe('Unit | Run | Services | Slack | Commands', function () {
  beforeEach(function () {
    // given
    sinon.stub(axios, 'post');
    sinon.stub(releasesService, 'deployPixRepo').resolves();
    sinon.stub(releasesService, 'publishPixRepo').resolves('v1.0.0');
    sinon.stub(githubServices, 'getLatestReleaseTag').resolves('v1.0.0');
  });

  describe('#createAndDeployPixSiteRelease', function () {
    describe('when releaseType is set to minor', function () {
      beforeEach(async function () {
        // given
        const payload = { text: 'minor', response_url: 'http://example.net/callback' };
        // when
        await createAndDeployPixSiteRelease(payload);
      });

      it('should publish a new release', function () {
        // then
        sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-site', 'minor');
      });

      it('should deploy the release for pix-site and pix-pro', function () {
        // then
        sinon.assert.calledWith(releasesService.deployPixRepo, 'pix-site', 'pix-site', 'v1.0.0');
        sinon.assert.calledWith(releasesService.deployPixRepo, 'pix-site', 'pix-pro', 'v1.0.0');
      });

      it('should inform the user of the progress', function () {
        sinon.assert.calledWith(axios.post, 'http://example.net/callback', {
          text: "Le script de déploiement de la release 'v1.0.0' pour pix-site, pix-pro en production s'est déroulé avec succès. En attente de l'installation des applications sur Scalingo…",
        });
      });
    });

    describe('when releaseType is not set to a valid value', function () {
      it('should publish a new minor release', async function () {
        // given
        const payload = { text: '' };
        // when
        await createAndDeployPixSiteRelease(payload);
        // then
        sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-site', 'minor');
      });
    });

    describe('when something fails', function () {
      it('should inform the user', async function () {
        // given
        const payload = { response_url: 'http://example.net/callback' };
        releasesService.publishPixRepo.rejects();
        // when
        await createAndDeployPixSiteRelease(payload);
        // then
        sinon.assert.calledWith(axios.post, 'http://example.net/callback', {
          text: 'Erreur lors du déploiement de pix-site, pix-pro en production.',
        });
      });
    });
  });

  describe('#createAndDeployPixUI', function () {
    it('should publish a new release', async function () {
      // given
      const payload = { text: 'minor' };

      // when
      await createAndDeployPixUI(payload);

      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-ui', 'minor');
    });

    it('should retrieve the last release tag from GitHub', async function () {
      // given
      const payload = { text: 'minor' };

      // when
      await createAndDeployPixUI(payload);

      // then
      sinon.assert.calledOnceWithExactly(githubServices.getLatestReleaseTag, 'pix-ui');
    });

    it('should create a minor version if no version is given', async function () {
      // given
      const payload = { text: '' };

      // when
      await createAndDeployPixUI(payload);

      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-ui', 'minor');
    });
  });

  describe('#createAndDeployEmberTestingLibrary', function () {
    it('should publish a new release', async function () {
      // given
      const payload = { text: 'minor' };

      // when
      await createAndDeployEmberTestingLibrary(payload);

      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'ember-testing-library', 'minor');
    });

    it('should retrieve the last release tag from GitHub', async function () {
      // given
      const payload = { text: 'minor' };

      // when
      await createAndDeployEmberTestingLibrary(payload);

      // then
      sinon.assert.calledWith(githubServices.getLatestReleaseTag, 'ember-testing-library');
    });

    it('should create a minor version if no version is given', async function () {
      // given
      const payload = { text: '' };

      // when
      await createAndDeployEmberTestingLibrary(payload);

      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'ember-testing-library', 'minor');
    });
  });

  describe('#createAndDeployPixLCMS', function () {
    let client;

    beforeEach(async function () {
      // given
      client = { deployFromArchive: sinon.spy() };
      sinon.stub(ScalingoClient, 'getInstance').resolves(client);
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixLCMS(payload);
    });

    it('should publish a new release', function () {
      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-editor', 'minor');
    });

    it('should deploy the release on production', function () {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-lcms-production', 'v1.0.0');
    });

    it('should deploy the release on minimal', function () {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-lcms-minimal-production', 'v1.0.0');
    });
  });

  describe('#createAndDeployPixAPIData', function () {
    let client;

    beforeEach(async function () {
      // given
      client = { deployFromArchive: sinon.spy() };
      sinon.stub(ScalingoClient, 'getInstance').resolves(client);
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixAPIData(payload);
    });

    it('should publish a new release', function () {
      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-api-data', 'minor');
    });

    it('should deploy the release on production', function () {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-api-data-production', 'v1.0.0');
    });
  });

  describe('#createAndDeployPixBotRelease', function () {
    let client;

    beforeEach(async function () {
      // given
      client = { deployFromArchive: sinon.spy() };
      sinon.stub(ScalingoClient, 'getInstance').resolves(client);
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixBotRelease(payload);
    });

    it('should publish a new release', function () {
      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-bot', 'minor');
    });

    it('should deploy the release for pix-bot-build', function () {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-bot-build-production', 'v1.0.0');
    });

    it('should deploy the release for pix-bot-run', function () {
      // then
      sinon.assert.calledWith(client.deployFromArchive, 'pix-bot-run-production', 'v1.0.0');
    });
  });

  describe('#createAndDeployPixDatawarehouse', function () {
    beforeEach(async function () {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixDatawarehouse(payload);
    });

    it('should publish a new release', function () {
      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-db-replication', 'minor');
    });

    it('should deploy the release', function () {
      // then
      sinon.assert.calledWith(releasesService.deployPixRepo);
    });
  });

  describe('#getAndDeployLastVersion', function () {
    it('should redeploy last version of an app', async function () {
      // given
      const appName = 'pix-admin-integration';

      // when
      await getAndDeployLastVersion({ appName });

      // then
      sinon.assert.calledWith(releasesService.deployPixRepo, 'pix', 'pix-admin', 'v1.0.0', 'integration');
    });

    it('should throw an error if appName is incorrect', async function () {
      // given
      const appName = 'pix-admin';

      // when
      const response = await catchErr(getAndDeployLastVersion)({ appName });

      // then
      expect(response).to.be.instanceOf(Error);
    });

    it('should throw an error if appName is not from pix repo', async function () {
      // given
      const appName = 'pix-site-production';

      // when
      const response = await catchErr(getAndDeployLastVersion)({ appName });

      // then
      expect(response).to.be.instanceOf(Error);
    });
  });

  describe('#createAndDeployDbStats', function () {
    beforeEach(async function () {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployDbStats(payload);
    });

    it('should publish a new release', function () {
      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-db-stats', 'minor');
    });

    it('should deploy the release', function () {
      // then
      sinon.assert.calledWith(releasesService.deployPixRepo);
    });
  });

  describe('#createAndDeployPixTutosRelease', function () {
    beforeEach(async function () {
      // given
      const payload = { text: 'minor' };
      // when
      await createAndDeployPixTutosRelease(payload);
    });

    it('should publish a new release', function () {
      // then
      sinon.assert.calledWith(releasesService.publishPixRepo, 'pix-tutos', 'minor');
    });

    it('should deploy the release', function () {
      // then
      sinon.assert.calledWith(releasesService.deployPixRepo);
    });
  });
});
