import { fromBranch } from '../../../common/deployer';
import { expect, nock } from '../../test-helper';

describe('Integration | Common | Deployer', function () {
  describe('#fromBranch', function () {
    it('should call Scalingo API to deploy the repository branch', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});

      const deploymentPayload = {
        deployment: {
          git_ref: 'my-branch',
          source_url: 'https://undefined@github.com/github-owner/my-repository/archive/my-branch.tar.gz',
        },
      };
      const scalingoDeploy1Nock = nock('https://scalingo.production')
        .post('/v1/apps/my-app-1/deployments', deploymentPayload)
        .reply(200, {});
      const scalingoDeploy2Nock = nock('https://scalingo.production')
        .post('/v1/apps/my-app-2/deployments', deploymentPayload)
        .reply(200, {});

      await fromBranch('my-repository', ['my-app-1', 'my-app-2'], 'my-branch')();

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(scalingoDeploy1Nock.isDone()).to.be.true;
      expect(scalingoDeploy2Nock.isDone()).to.be.true;
    });
  });
});
