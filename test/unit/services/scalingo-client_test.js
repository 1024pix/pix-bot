const { describe, it } = require('mocha');
const sinon = require('sinon');
const scalingo = require('scalingo');

const ScalingoClient = require('../../../lib/services/scalingo-client');
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
            source_url: `https://github.com/github-owner/github-repository/archive/v1.0.tar.gz`
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
});
