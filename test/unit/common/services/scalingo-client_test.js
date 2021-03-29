const { describe, it } = require('mocha');
const { sinon } = require('../../../test-helper');
const scalingo = require('scalingo');
const axios = require('axios');

const ScalingoClient = require('../../../../common/services/scalingo-client');
const { expect } = require('chai');

describe('Scalingo client', () => {
  describe('#ScalingoClient.getInstance', () => {

    it('should return the Scalingo client instance for recette', async () => {
      // given
      sinon.stub(scalingo, 'clientFromToken')
        .withArgs('tk-us-scalingo-token-recette', { apiUrl: 'https://scalingo.recette' })
        .resolves({ apiClient: () => {} });
      // when
      const scalingoClient = await ScalingoClient.getInstance('recette');
      // then
      expect(scalingoClient).to.be.an.instanceof(ScalingoClient);
      expect(scalingoClient.client).to.exist;
    });

    it('should return the Scalingo client instance for production', async () => {
      // given
      sinon.stub(scalingo, 'clientFromToken')
        .withArgs('tk-us-scalingo-token-production', { apiUrl: 'https://scalingo.production' })
        .resolves({ apiClient: () => {} });
      // when
      const scalingoClient = await ScalingoClient.getInstance('production');
      // then
      expect(scalingoClient).to.be.an.instanceof(ScalingoClient);
      expect(scalingoClient.client).to.exist;
    });

    it('should throw an error when scalingo authentication failed', async () => {
      // given
      sinon.stub(scalingo, 'clientFromToken').rejects(new Error('Invalid credentials'));
      // when
      let scalingoClient;
      try {
        scalingoClient = await ScalingoClient.getInstance('production');
        expect.fail('should raise an error when credentials are invalid');
      } catch (e) {
        expect(e.message).to.equal('Invalid credentials');
        expect(scalingoClient).to.be.undefined;
      }
    });
  });

  describe('#ScalingoClient.deployFromArchive', () => {
    let apiClientPost;
    let scalingoClient;

    beforeEach(async () => {
      apiClientPost = sinon.stub();
      sinon.stub(scalingo, 'clientFromToken')
        .resolves({ apiClient: () => ({ post: apiClientPost }) });

      scalingoClient = await ScalingoClient.getInstance('production');
    });

    it('should not deploy without app given', async () => {
      try {
        await scalingoClient.deployFromArchive(null, 'v1.0');
        expect.fail('Should throw an error when no application given');
      } catch (e) {
        expect(e.message).to.equal('No application to deploy.');
      }
    });

    it('should not deploy without a release tag given', async () => {
      try {
        await scalingoClient.deployFromArchive('pix-app', null);
        expect.fail('Should throw an error when no release tag given');
      } catch (e) {
        expect(e.message).to.equal('No release tag to deploy.');
      }
    });

    it('should deploy an application for a given tag', async () => {
      // given
      // when
      const result = await scalingoClient.deployFromArchive('pix-app', 'v1.0');
      // then
      sinon.assert.calledWithExactly(
        apiClientPost,
        '/apps/pix-app-production/deployments',
        {
          deployment: {
            git_ref: 'v1.0',
            source_url: 'https://github-personal-access-token@github.com/github-owner/github-repository/archive/v1.0.tar.gz'
          },
        }
      );
      expect(result).to.be.equal('Deployed pix-app-production v1.0');
    });

    it('should deploy an application without the environment suffix', async () => {
      // given
      // when
      const result = await scalingoClient.deployFromArchive('pix-app', 'v1.0', undefined, { withEnvSuffix: false });
      // then
      expect(result).to.be.equal('Deployed pix-app v1.0');
    });

    it('should deploy an application for a given repository', async () => {
      // given
      // when
      const result = await scalingoClient.deployFromArchive('pix-app', 'v1.0', 'given-repository');
      // then
      sinon.assert.calledWithExactly(
        apiClientPost,
        '/apps/pix-app-production/deployments',
        {
          deployment: {
            git_ref: 'v1.0',
            source_url: 'https://github-personal-access-token@github.com/github-owner/given-repository/archive/v1.0.tar.gz'
          },
        }
      );
      expect(result).to.be.equal('Deployed pix-app-production v1.0');
    });

    it('should failed when application does not exists', async () => {
      // given
      sinon.stub(console, 'error');
      apiClientPost.rejects(new Error());
      // when
      try {
        await scalingoClient.deployFromArchive('unknown-app', 'v1.0');
        expect.fail('Should throw an error when application doesnt exists');
      } catch (e) {
        expect(e.message).to.equal('Impossible to deploy unknown-app-production v1.0');
      }
    });
  });

  describe('#Scalingo.getAppInfo', () => {
    let clientAppsFind;
    let clientDeploymentsFind;
    let scalingoClient;
    let axiosGet;

    beforeEach(async () => {
      clientAppsFind = sinon.stub();
      clientDeploymentsFind = sinon.stub();
      sinon.stub(scalingo, 'clientFromToken').resolves({
        Apps: { find: clientAppsFind },
        Deployments: { find: clientDeploymentsFind },
      });

      axiosGet = sinon.stub(axios, 'get');

      scalingoClient = await ScalingoClient.getInstance('production');
    });

    it('should return app info', async () => {
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
      const info = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(info.name).to.equal('pix-app-production');
      expect(info.url).to.equal('https://app.pix.fr');
    });

    it('should return last deployment info', async () => {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({
        created_at: '2021-03-23T11:02:20.955Z',
        git_ref: 'v1.1.1',
        pusher: { username: 'Bob' },
      });

      // when
      const info = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(info.lastDeployementAt).to.equal('2021-03-23T11:02:20.955Z');
      expect(info.lastDeployedBy).to.equal('Bob');
      expect(info.lastDeployedVersion).to.equal('v1.1.1');
    });

    it('should return application status when UP', async () => {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        url: 'https://app.pix.fr',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({ pusher: {} });
      axiosGet.withArgs('https://app.pix.fr').resolves();

      // when
      const info = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(info.isUp).to.equal(true);
    });

    it('should return application status when DOWN', async () => {
      // given
      clientAppsFind.withArgs('pix-app-production').resolves({
        url: 'https://app.pix.fr',
        last_deployment_id: 'deployment-id-1',
      });
      clientDeploymentsFind.withArgs('pix-app-production', 'deployment-id-1').resolves({ pusher: {} });
      axiosGet.withArgs('https://app.pix.fr').rejects();

      // when
      const info = await scalingoClient.getAppInfo('pix-app-production');

      // then
      expect(info.isUp).to.equal(false);
    });

    it('should throw an error if app does not exist', async () => {
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
});
