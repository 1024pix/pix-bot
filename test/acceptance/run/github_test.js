import { config } from '../../../config.js';
import server from '../../../server.js';
import { createGithubWebhookSignatureHeader, expect, nock, sinon, StatusCodes } from '../../test-helper.js';

describe('Acceptance | Run | Github', function () {
  describe('POST /run/github/webhook', function () {
    let body;

    describe('on release event', function () {
      context('when the repository is not configured', function () {
        it('responds with 200', async function () {
          // given
          sinon.stub(config, 'repoAppNames').value({});
          const tag = 'v0.1.0';
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);

          const body = {
            action: 'released',
            release: {
              tag_name: tag,
            },
            repository: {
              organization: '1024pix',
              name: 'pix-test',
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/run/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'release',
            },
            payload: body,
          });
          expect(res.statusCode).to.equal(StatusCodes.OK);
          expect(res.result).to.equal('No Scalingo app configured for this repository');
          expect(scalingoAuth.isDone()).to.be.false;
        });
      });

      context('when the repository is configured', function () {
        it('responds with 200, deploy the repo on Scalingo', async function () {
          // given
          sinon.stub(config, 'repoAppNames').value({
            'pix-test': ['pix-test-app-production'],
          });

          const tag = 'v0.1.0';
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
          const scalingoDeploymentPayload = {
            deployment: {
              git_ref: tag,
              source_url: 'https://undefined@github.com/github-owner/pix-test/archive/v0.1.0.tar.gz',
            },
          };
          const scalingoDeploy = nock('https://scalingo.production')
            .post(`/v1/apps/pix-test-app-production/deployments`, scalingoDeploymentPayload)
            .reply(200, {});

          const body = {
            action: 'released',
            release: {
              tag_name: tag,
            },
            repository: {
              organization: '1024pix',
              name: 'pix-test',
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/run/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'release',
            },
            payload: body,
          });
          expect(res.statusCode).to.equal(StatusCodes.OK);
          expect(res.result).to.deep.equal(['pix-test-app-production v0.1.0 has been deployed']);
          expect(scalingoAuth.isDone()).to.be.true;
          expect(scalingoDeploy.isDone()).to.be.true;
        });
      });
    });

    it('responds with 200 and do nothing for other event', async function () {
      body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/run/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'deployment',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('Ignoring deployment event');
    });

    it('responds with 401 on a bad signature', async function () {
      body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/run/github/webhook',
        headers: {
          'x-hub-signature-256': 'sha256=test',
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });
  });
});
