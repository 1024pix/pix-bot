import axios from 'axios';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import ScalingoClient from '../../../../common/services/scalingo-client.js';
import { config } from '../../../../config.js';
import { catchErr, sinon } from '../../../test-helper.js';

describe('Scalingo client', function () {
  beforeEach(function () {
    config.github.token = 'github-personal-access-token';
  });

  afterEach(function () {
    config.github.token = null;
  });

  describe('#ScalingoClient.getInstance', function () {
    it('should return the Scalingo client instance for recette', async function () {
      // given
      const clientStub = {
        clientFromToken: async function () {
          return sinon.stub();
        },
      };

      // when
      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);
      // then
      expect(scalingoClient).to.be.an.instanceof(ScalingoClient);
      expect(scalingoClient.client).to.exist;
    });

    it('should return the Scalingo client instance for production', async function () {
      // given
      const clientStub = {
        clientFromToken: async function () {
          return sinon.stub();
        },
      };

      // when
      const scalingoClient = await ScalingoClient.getInstance('production', clientStub);
      // then
      expect(scalingoClient).to.be.an.instanceof(ScalingoClient);
      expect(scalingoClient.client).to.exist;
    });

    it('should throw an error when no token is provided', async function () {
      // given
      sinon.stub(config.scalingo, 'integration').value({
        token: undefined,
        url: 'https://api.osc-fr1.scalingo.com',
      });
      // when
      try {
        await ScalingoClient.getInstance('integration');
        expect.fail('should raise an error when credentials are missing');
      } catch (e) {
        expect(e.message).to.equal('Scalingo credentials missing for environment integration');
      }
    });

    it('should throw an error when scalingo authentication failed', async function () {
      // given
      const clientStub = {
        clientFromToken: async function () {
          throw new Error('Invalid credentials');
        },
      };

      // when
      let scalingoClient;
      try {
        scalingoClient = await ScalingoClient.getInstance('production', clientStub);
        expect.fail('should raise an error when credentials are invalid');
      } catch (e) {
        expect(e.message).to.equal('Invalid credentials');
        expect(scalingoClient).to.be.undefined;
      }
    });
  });

  describe('#ScalingoClient.deployFromArchive', function () {
    let createDeploymentStub;
    let scalingoClient;

    beforeEach(async function () {
      createDeploymentStub = sinon.stub();
      const clientStub = {
        clientFromToken: async function () {
          return { Deployments: { create: createDeploymentStub } };
        },
      };

      scalingoClient = await ScalingoClient.getInstance('production', clientStub);
    });

    it('should not deploy without app given', async function () {
      try {
        await scalingoClient.deployFromArchive(null, 'v1.0');
        expect.fail('Should throw an error when no application given');
      } catch (e) {
        expect(e.message).to.equal('No application to deploy.');
      }
    });

    it('should not deploy without a release tag given', async function () {
      try {
        await scalingoClient.deployFromArchive('pix-app', null);
        expect.fail('Should throw an error when no release tag given');
      } catch (e) {
        expect(e.message).to.equal('No release tag to deploy.');
      }
    });

    it('should deploy an application for a given tag', async function () {
      // given
      // when
      const result = await scalingoClient.deployFromArchive('pix-app', 'v1.0');
      // then
      sinon.assert.calledWithExactly(createDeploymentStub, 'pix-app-production', {
        git_ref: 'v1.0',
        source_url:
          'https://github-personal-access-token@github.com/github-owner/github-repository/archive/v1.0.tar.gz',
      });
      expect(result).to.be.equal('pix-app-production v1.0 has been deployed');
    });

    it('should deploy an application without the environment suffix', async function () {
      // given
      // when
      const result = await scalingoClient.deployFromArchive('pix-app', 'v1.0', undefined, { withEnvSuffix: false });
      // then
      expect(result).to.be.equal('pix-app v1.0 has been deployed');
    });

    it('should deploy an application for a given repository', async function () {
      // given
      // when
      const result = await scalingoClient.deployFromArchive('pix-app', 'v1.0', 'given-repository');
      // then
      sinon.assert.calledWithExactly(createDeploymentStub, 'pix-app-production', {
        git_ref: 'v1.0',
        source_url: 'https://github-personal-access-token@github.com/github-owner/given-repository/archive/v1.0.tar.gz',
      });
      expect(result).to.be.equal('pix-app-production v1.0 has been deployed');
    });

    it('should fail when application does not exists', async function () {
      // given
      sinon.stub(console, 'error');
      createDeploymentStub.rejects(new Error());
      // when
      try {
        await scalingoClient.deployFromArchive('unknown-app', 'v1.0');
        expect.fail('Should throw an error when application doesnt exists');
      } catch (e) {
        expect(e.message).to.equal('Unable to deploy unknown-app-production v1.0');
      }
    });
  });

  describe('#ScalingoClient.deployUsingSCM', function () {
    let manualDeployStub;
    let scalingoClient;

    beforeEach(async function () {
      manualDeployStub = sinon.stub();
      const clientStub = {
        clientFromToken: async function () {
          return { SCMRepoLinks: { manualDeploy: manualDeployStub } };
        },
      };

      scalingoClient = await ScalingoClient.getInstance('production', clientStub);
    });

    it('should deploy an application for a given tag', async function () {
      await scalingoClient.deployUsingSCM('pix-app-production', 'v1.0');
      expect(manualDeployStub).to.have.been.calledOnceWithExactly('pix-app-production', 'v1.0');
    });

    it('should fail when application does not exists', async function () {
      // given
      sinon.stub(console, 'error');
      manualDeployStub.rejects(new Error());
      // when
      try {
        await scalingoClient.deployUsingSCM('unknown-app-production', 'v1.0');
        expect.fail('Should throw an error when application doesnt exists');
      } catch (e) {
        expect(e.message).to.equal('Unable to deploy unknown-app-production v1.0');
      }
    });
  });

  describe('#Scalingo.getAppInfo', function () {
    let clientAppsFind;
    let clientDeploymentsFind;
    let scalingoClient;
    let axiosGet;

    beforeEach(async function () {
      clientAppsFind = sinon.stub();
      clientDeploymentsFind = sinon.stub();

      axiosGet = sinon.stub(axios, 'get');

      const clientStub = {
        clientFromToken: async function () {
          return {
            Apps: { find: clientAppsFind },
            Deployments: { find: clientDeploymentsFind },
          };
        },
      };

      scalingoClient = await ScalingoClient.getInstance('production', clientStub);
    });

    it('should return app info', async function () {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        id: '5e6660f0623d3a000f479124',
        name: 'pix-app-production',
        url: 'https://app.pix.fr',
        status: 'running',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({ pusher: {} });

      // when
      const appInfos = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(appInfos.length).to.equal(1);
      expect(appInfos[0].name).to.equal('pix-app-production');
      expect(appInfos[0].url).to.equal('https://app.pix.fr');
    });

    it('should return last deployment info', async function () {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        last_deployment_id: 'deployment-id-1',
        url: 'https://app.pix.fr',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({
        created_at: '2021-03-23T11:02:20.955Z',
        git_ref: 'v1.1.1',
        pusher: { username: 'Bob' },
      });

      // when
      const appInfos = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(appInfos.length).to.equal(1);
      expect(appInfos[0].lastDeployementAt).to.equal('2021-03-23T11:02:20.955Z');
      expect(appInfos[0].lastDeployedBy).to.equal('Bob');
      expect(appInfos[0].lastDeployedVersion).to.equal('v1.1.1');
    });

    it('should return application status when UP', async function () {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        url: 'https://app.pix.fr',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({ pusher: {} });
      axiosGet.withArgs('https://app.pix.fr').resolves();

      // when
      const appInfos = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(appInfos.length).to.equal(1);
      expect(appInfos[0].isUp).to.equal(true);
    });

    it('should return application status when DOWN', async function () {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        url: 'https://app.pix.fr',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({ pusher: {} });
      axiosGet.withArgs('https://app.pix.fr').rejects();

      // when
      const appInfos = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(appInfos.length).to.equal(1);
      expect(appInfos[0].isUp).to.equal(false);
    });

    it('should return production info by default with short name', async function () {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        id: '5e6660f0623d3a000f479124',
        name: 'pix-app-production',
        url: 'https://app.pix.fr',
        status: 'running',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({ pusher: {} });

      // when
      const appInfos = await scalingoClient.getAppInfo('app');

      // then
      expect(appInfos.length).to.equal(1);
      expect(appInfos[0].name).to.equal('pix-app-production');
      expect(appInfos[0].url).to.equal('https://app.pix.fr');
    });

    it('should return correct app with full name', async function () {
      // given
      clientAppsFind.withArgs('pix-app-recette').resolves({
        id: '5e6660f0623d3a000f479124',
        name: 'pix-app-recette',
        url: 'https://app.recette.pix.fr',
        status: 'running',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-recette', 'deployment-id-1').resolves({ pusher: {} });

      // when
      const appInfos = await scalingoClient.getAppInfo('pix-app-recette');

      // then
      expect(appInfos[0].name).to.equal('pix-app-recette');
      expect(appInfos[0].url).to.equal('https://app.recette.pix.fr');
    });

    it('should suffix api url with /api', async function () {
      // given
      clientAppsFind.withArgs('pix-api-production').resolves({
        url: 'https://api.pix.fr',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-api-production', 'deployment-id-1').resolves({ pusher: {} });
      const axiosSpy = axiosGet.withArgs('https://api.pix.fr/api').resolves();

      // when
      const appInfos = await scalingoClient.getAppInfo('pix-api-production');

      // then
      expect(appInfos.length).to.equal(1);
      expect(appInfos[0].isUp).to.equal(true);
      expect(axiosSpy.called).to.equal(true);
    });

    it('should return all production app info', async function () {
      // given
      clientAppsFind.withArgs('pix-api-production').resolves({
        url: 'https://api.pix.fr',
        last_deployment_id: 'deployment-id-1',
      });
      clientAppsFind.withArgs('pix-app-production').resolves({
        url: 'https://app.pix.fr',
        last_deployment_id: 'deployment-id-2',
      });
      clientAppsFind.withArgs('pix-orga-production').resolves({
        url: 'https://orga.pix.fr',
        last_deployment_id: 'deployment-id-3',
      });
      clientAppsFind.withArgs('pix-certif-production').resolves({
        url: 'https://certif.pix.fr',
        last_deployment_id: 'deployment-id-4',
      });
      clientAppsFind.withArgs('pix-admin-production').resolves({
        url: 'https://admin.pix.fr',
        last_deployment_id: 'deployment-id-5',
      });
      clientDeploymentsFind.withArgs('pix-api-production', 'deployment-id-1').resolves({ pusher: {} });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-2').resolves({ pusher: {} });
      clientDeploymentsFind.withArgs('pix-orga-production', 'deployment-id-3').resolves({ pusher: {} });
      clientDeploymentsFind.withArgs('pix-certif-production', 'deployment-id-4').resolves({ pusher: {} });
      clientDeploymentsFind.withArgs('pix-admin-production', 'deployment-id-5').resolves({ pusher: {} });
      const apiPing = axiosGet.withArgs('https://api.pix.fr/api').resolves();
      const appPing = axiosGet.withArgs('https://app.pix.fr').resolves();
      const orgaPing = axiosGet.withArgs('https://orga.pix.fr').resolves();
      const adminPing = axiosGet.withArgs('https://admin.pix.fr').resolves();
      const certifPing = axiosGet.withArgs('https://certif.pix.fr').resolves();

      // when
      const appInfos = await scalingoClient.getAppInfo('production');

      // then
      expect(appInfos.length).to.equal(5);
      expect(appInfos[0].isUp).to.equal(true);
      expect(appInfos[1].isUp).to.equal(true);
      expect(appInfos[2].isUp).to.equal(true);
      expect(appInfos[3].isUp).to.equal(true);
      expect(appInfos[4].isUp).to.equal(true);
      expect(apiPing.called).to.equal(true);
      expect(appPing.called).to.equal(true);
      expect(orgaPing.called).to.equal(true);
      expect(adminPing.called).to.equal(true);
      expect(certifPing.called).to.equal(true);
    });

    it('should throw an error if app does not exist', async function () {
      // given
      clientAppsFind.withArgs('pix-toto-production').rejects({ status: 404 });

      // when / then
      try {
        await scalingoClient.getAppInfo('pix-toto-production');
        expect.fail('Should throw an error when application does not exists');
      } catch (e) {
        expect(e.message).to.equal('Impossible to get info for pix-toto-production');
      }
    });
  });

  describe('#Scalingo.deployReviewApp', function () {
    let manualReviewApp;
    let scalingoClient;

    beforeEach(async function () {
      manualReviewApp = sinon.stub();
      const clientStub = {
        clientFromToken: async function () {
          return {
            SCMRepoLinks: {
              manualReviewApp,
            },
          };
        },
      };

      scalingoClient = await ScalingoClient.getInstance('reviewApps', clientStub);
    });

    it('should call manualReviewApp', async function () {
      // given
      manualReviewApp.withArgs('pix-app-review', 1).resolves();

      // when
      await scalingoClient.deployReviewApp('pix-app-review', 1);

      // then
      expect(manualReviewApp.called).to.be.true;
    });
  });

  describe('#Scalingo.disableAutoDeploy', function () {
    let update;
    let scalingoClient;

    beforeEach(async function () {
      update = sinon.stub();
      const clientStub = {
        clientFromToken: async function () {
          return {
            SCMRepoLinks: {
              update,
            },
          };
        },
      };

      scalingoClient = await ScalingoClient.getInstance('reviewApps', clientStub);
    });

    it('should call update', async function () {
      // given
      update.withArgs('pix-app-review').resolves();

      // when
      await scalingoClient.disableAutoDeploy('pix-app-review');

      // then
      expect(update.called).to.be.true;
    });
  });

  describe('#Scalingo.createApplication', function () {
    it('should return application identifier', async function () {
      // given
      const createApplicationStub = sinon.stub();
      const updateApplicationStub = sinon.stub();
      createApplicationStub.resolves({ id: 1 });
      updateApplicationStub.resolves();

      const clientStub = {
        clientFromToken: async function () {
          return { Apps: { create: createApplicationStub, update: updateApplicationStub } };
        },
      };

      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      // when
      const actual = await scalingoClient.createApplication('pix-application-recette');

      // then
      expect(actual).to.equal(1);
    });

    it('should call create with application name', async function () {
      // given
      const createApplicationStub = sinon.stub();
      const updateApplicationStub = sinon.stub();
      createApplicationStub.resolves({ id: 1 });
      updateApplicationStub.resolves();
      const clientStub = {
        clientFromToken: async function () {
          return { Apps: { create: createApplicationStub, update: updateApplicationStub } };
        },
      };
      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      // when
      await scalingoClient.createApplication('pix-application-recette');

      // then
      expect(createApplicationStub).to.have.been.calledOnceWithExactly({ name: 'pix-application-recette' });
    });

    it('should call update with valid options', async function () {
      // given
      const createApplicationStub = sinon.stub();
      const updateApplicationStub = sinon.stub();
      createApplicationStub.resolves({ id: 1 });
      updateApplicationStub.resolves();
      const clientStub = {
        clientFromToken: async function () {
          return { Apps: { create: createApplicationStub, update: updateApplicationStub } };
        },
      };
      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      // when
      await scalingoClient.createApplication('pix-application-recette');

      // then
      expect(updateApplicationStub).to.have.been.calledOnceWithExactly(1, { force_https: true, router_logs: true });
    });

    it('should throw when scalingo client throw an error', async function () {
      // given
      const createApplicationStub = sinon.stub();
      const updateApplicationStub = sinon.stub();
      createApplicationStub.resolves({ id: 1 });
      updateApplicationStub.rejects({
        name: 'foo',
      });
      const clientStub = {
        clientFromToken: async function () {
          return { Apps: { create: createApplicationStub, update: updateApplicationStub } };
        },
      };
      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      // when
      let actual;
      try {
        await scalingoClient.createApplication('pix-application-recette');
      } catch (error) {
        actual = error;
      }

      // then
      expect(actual.message).to.equal('Impossible to create pix-application-recette, foo');
    });
  });

  describe('#Scalingo.updateAutoscaler', function () {
    it('should update web autoscaler for one application', async function () {
      // given
      const forAutoscalerStub = sinon.stub();
      const updateAutoscalerStub = sinon.stub();

      forAutoscalerStub.resolves([
        {
          id: 'au-123456789',
          container_type: 'web',
        },
        {
          id: 'au-111111111',
          container_type: 'worker',
        },
      ]);

      updateAutoscalerStub.resolves();

      const clientStub = {
        clientFromToken: async function () {
          return { Autoscalers: { for: forAutoscalerStub, update: updateAutoscalerStub } };
        },
      };

      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      const autoscalerUpdateParams = {
        min_containers: 1,
        max_containers: 2,
      };

      // when
      await scalingoClient.updateAutoscaler('pix-application-recette', autoscalerUpdateParams);

      // then
      expect(forAutoscalerStub.calledOnceWith('pix-application-recette')).to.be.true;
      expect(updateAutoscalerStub.calledOnceWith('pix-application-recette', 'au-123456789', autoscalerUpdateParams)).to
        .be.true;
    });

    it('should throw when web autoscaler not found', async function () {
      // given
      const forAutoscalerStub = sinon.stub();
      const updateAutoscalerStub = sinon.stub();

      forAutoscalerStub.resolves([
        {
          id: 'au-111111111',
          container_type: 'worker',
        },
      ]);

      updateAutoscalerStub.resolves();

      const clientStub = {
        clientFromToken: async function () {
          return { Autoscalers: { for: forAutoscalerStub, update: updateAutoscalerStub } };
        },
      };

      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      const autoscalerUpdateParams = {
        min_containers: 1,
        max_containers: 2,
      };

      // when
      let actual;
      try {
        await scalingoClient.updateAutoscaler('pix-application-recette', autoscalerUpdateParams);
      } catch (error) {
        actual = error;
      }

      // then
      expect(actual.message).to.equal("Aucun autoscaler web trouvé pour l'application 'pix-application-recette'");
      expect(updateAutoscalerStub.called).to.be.false;
    });

    it('should throw when autoscaler not found', async function () {
      // given
      const forAutoscalerStub = sinon.stub();
      const updateAutoscalerStub = sinon.stub();

      forAutoscalerStub.resolves([]);

      updateAutoscalerStub.resolves();

      const clientStub = {
        clientFromToken: async function () {
          return { Autoscalers: { for: forAutoscalerStub, update: updateAutoscalerStub } };
        },
      };

      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      const autoscalerUpdateParams = {
        min_containers: 1,
        max_containers: 2,
      };

      // when
      let actual;
      try {
        await scalingoClient.updateAutoscaler('pix-application-recette', autoscalerUpdateParams);
      } catch (error) {
        actual = error;
      }

      // then
      expect(actual.message).to.equal("Aucun autoscaler trouvé pour l'application 'pix-application-recette'");
    });

    it('should throw when autoscaler api return undefined', async function () {
      // given
      const forAutoscalerStub = sinon.stub();
      const updateAutoscalerStub = sinon.stub();

      forAutoscalerStub.resolves(undefined);

      updateAutoscalerStub.resolves();

      const clientStub = {
        clientFromToken: async function () {
          return { Autoscalers: { for: forAutoscalerStub, update: updateAutoscalerStub } };
        },
      };

      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      const autoscalerUpdateParams = {
        min_containers: 1,
        max_containers: 2,
      };

      // when
      let actual;
      try {
        await scalingoClient.updateAutoscaler('pix-application-recette', autoscalerUpdateParams);
      } catch (error) {
        actual = error;
      }

      // then
      expect(actual.message).to.equal("Aucun autoscaler trouvé pour l'application 'pix-application-recette'");
    });

    it('should throw when autoscaler api return null', async function () {
      // given
      const forAutoscalerStub = sinon.stub();
      const updateAutoscalerStub = sinon.stub();

      forAutoscalerStub.resolves(null);

      updateAutoscalerStub.resolves();

      const clientStub = {
        clientFromToken: async function () {
          return { Autoscalers: { for: forAutoscalerStub, update: updateAutoscalerStub } };
        },
      };

      const scalingoClient = await ScalingoClient.getInstance('recette', clientStub);

      const autoscalerUpdateParams = {
        min_containers: 1,
        max_containers: 2,
      };

      // when
      let actual;
      try {
        await scalingoClient.updateAutoscaler('pix-application-recette', autoscalerUpdateParams);
      } catch (error) {
        actual = error;
      }

      // then
      expect(actual.message).to.equal("Aucun autoscaler trouvé pour l'application 'pix-application-recette'");
    });
  });

  describe('#Scalingo.reviewAppExists', function () {
    let clientAppsFind;
    let scalingoClient;

    beforeEach(async function () {
      clientAppsFind = sinon.stub();
      const clientStub = {
        clientFromToken: async function () {
          return {
            Apps: { find: clientAppsFind },
          };
        },
      };
      scalingoClient = await ScalingoClient.getInstance('production', clientStub);
    });

    it('should return true when review app exists', async function () {
      //given
      const reviewAppName = 'reviewApp';
      clientAppsFind.withArgs(reviewAppName).resolves({ name: reviewAppName });
      //when
      const exists = await scalingoClient.reviewAppExists(reviewAppName);
      //then
      expect(exists).to.be.true;
    });

    it('should return false when review app does not exist', async function () {
      //given
      const reviewAppName = 'reviewApp';
      clientAppsFind.withArgs(reviewAppName).rejects({ status: 404 });
      //when
      const exists = await scalingoClient.reviewAppExists(reviewAppName);
      //then
      expect(exists).to.be.false;
    });

    it('should return throw an error when Scalingo API call fails', async function () {
      //given
      const reviewAppName = 'reviewApp';
      clientAppsFind.withArgs(reviewAppName).rejects({ status: 500, message: 'API unavailable' });
      //when
      let error;
      try {
        await scalingoClient.reviewAppExists(reviewAppName);
      } catch (err) {
        error = err;
      }
      //then
      expect(error.message).to.equal(
        'Impossible to get info for RA reviewApp. Scalingo API returned 500 : API unavailable',
      );
    });
  });

  describe('#Scalingo.deleteReviewApp', function () {
    let clientAppsDestroy;
    let client;

    beforeEach(async function () {
      clientAppsDestroy = sinon.stub();
      const clientStub = {
        clientFromToken: async function () {
          return {
            Apps: { destroy: clientAppsDestroy },
          };
        },
      };
      client = await ScalingoClient.getInstance('reviewApps', clientStub);
    });

    describe('When it is not a review app', function () {
      it('should throw an error', async function () {
        // given
        const appName = 'pix-api-production';

        // when
        const result = await catchErr(client.deleteReviewApp)(appName);

        // then
        expect(result).to.be.instanceOf(Error);
        expect(result.message).to.equal('Cannot call deleteReviewApp for a non review app.');
      });
    });

    it('should delete the review app', async function () {
      // given
      const appName = 'pix-api-review-pr1';

      // when
      await client.deleteReviewApp(appName);

      // then
      expect(clientAppsDestroy).to.have.been.calledWithExactly(appName, appName);
    });
  });
});
