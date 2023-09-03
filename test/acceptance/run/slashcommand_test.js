const { expect, createSlackWebhookSignatureHeaders, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Run | SlashCommand', function () {
  describe('POST /slack/commands/deploy-metabase', function () {
    it('responds with 200', async function () {
      const body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-metabase',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de Metabase en production bien reçue.');
    });
  });

  describe('POST /slack/commands/deploy-pix-apim', function () {
    it('responds with 200', async function () {
      const body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-pix-apim',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de Pix APIM en production bien reçue.');
    });
  });

  describe('POST /slack/commands/deploy-geoapi', function () {
    it('responds with 200', async function () {
      const body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-geoapi',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de GeoAPI en production bien reçue.');
    });
  });

  describe('POST /slack/commands/deploy-pix-360', function () {
    it('responds with 200', async function () {
      const body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-pix-360',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de Pix 360 en production bien reçue.');
    });
  });

  describe('POST /slack/commands/deploy-airflow', function () {
    it('responds with 200 and deploys pix-airflow-production', async function () {
      const body = {
        text: 'v0.0.1',
      };
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-airflow',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de Airflow en production bien reçue.');
    });

    it('should call Scalingo SCM', function (done) {
      const body = {
        text: 'v0.0.1',
      };
      nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});
      const scalingo = nock('https://scalingo.production')
        .post(`/v1/apps/pix-airflow-production/scm_repo_link/manual_deploy`, { branch: 'v0.0.1' })
        .reply(200, {});

      server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-airflow',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });

      scalingo.on('replied', () => {
        done();
      });
    });
  });

  describe('POST /slack/commands/deploy-dbt', function () {
    it('responds with 200 and deploys pix-dbt-production', async function () {
      const body = {
        text: 'v0.0.1',
      };
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-dbt',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de DBT en production bien reçue.');
    });

    it('should call Scalingo SCM', function (done) {
      const body = {
        text: 'v0.0.1',
      };
      nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});
      nock('https://scalingo.production')
        .post(`/v1/apps/pix-dbt-external-production/scm_repo_link/manual_deploy`, { branch: 'v0.0.1' })
        .reply(200, {});
      const scalingo = nock('https://scalingo.production')
        .post(`/v1/apps/pix-dbt-production/scm_repo_link/manual_deploy`, { branch: 'v0.0.1' })
        .reply(200, {});

      server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-dbt',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });

      scalingo.on('replied', () => {
        done();
      });
    });
  });
});
