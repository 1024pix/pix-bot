import { catchErr, expect, sinon } from '../../../test-helper.js';
import nock from 'nock';

import { getVersionList, finalize } from '../../../../common/services/jira.service.js';
import { config } from '../../../../config.js';
import { logger } from '../../../../common/services/logger.js';

describe('Integration | Common | Services | Jira', function () {
  let loggerStub;

  beforeEach(function () {
    sinon.stub(config, 'jira').value({
      host: 'https://test-jira.atlassian.net',
      userEmail: 'integration-test-user',
      apiToken: 'integration-test-token',
      projectId: 'PIX',
    });
    loggerStub = sinon.stub(logger, 'error');
  });

  afterEach(function () {
    sinon.restore();
    nock.cleanAll();
  });

  describe('#getVersionList', function () {
    it('should successfully fetch and return version list from Jira API', async function () {
      // given
      const mockVersions = { result: 'test-results' };

      nock('https://test-jira.atlassian.net')
        .get('/rest/api/3/project/PIX/versions')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', 'application/json')
        .reply(200, mockVersions);

      // when
      const result = await getVersionList();

      // then
      expect(result).to.deep.equal(mockVersions);
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle authentication failure gracefully', async function () {
      // given
      nock('https://test-jira.atlassian.net')
        .get('/rest/api/3/project/PIX/versions')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', 'application/json')
        .reply(401, {
          errorMessages: ['You do not have the permission to see the specified project.'],
          errors: {},
        });

      // when
      const result = await getVersionList();

      // then
      expect(result).to.be.undefined;
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle project not found error', async function () {
      // given
      nock('https://test-jira.atlassian.net')
        .get('/rest/api/3/project/PIX/versions')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('accept', 'application/json')
        .matchHeader('content-type', 'application/json')
        .reply(404, {
          errorMessages: ['No project could be found with key PIX.'],
          errors: {},
        });

      // when
      const result = await getVersionList();

      // then
      expect(result).to.be.undefined;
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle network timeout and log error', async function () {
      // given
      nock('https://test-jira.atlassian.net')
        .get('/rest/api/3/project/PIX/versions')
        .replyWithError({ code: 'ETIMEDOUT', message: 'Request timeout' });

      // when
      await catchErr(getVersionList)();

      // then
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.firstCall.args[0]).to.deep.include({
        event: 'Jira release',
        message: 'An error occurred',
        job: 'jira service',
        stack: 'get version list',
      });
    });

    it('should handle empty version list', async function () {
      // given
      nock('https://test-jira.atlassian.net')
        .get('/rest/api/3/project/PIX/versions')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('accept', 'application/json')
        .reply(200, []);

      // when
      const result = await getVersionList();

      // then
      expect(result).to.be.an('array').that.is.empty;
      expect(loggerStub).not.to.have.been.called;
    });
  });

  describe('#finalize', function () {
    it('should successfully finalize a version with current date', async function () {
      // given
      const versionId = '10000';
      const testDate = new Date('2025-06-30T14:30:00.000Z');
      const dateStub = sinon.stub(global, 'Date').returns(testDate);

      nock('https://test-jira.atlassian.net')
        .put('/rest/api/3/version/10000')
        .reply(200, function (uri, requestBody) {
          const body = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
          expect(body).to.deep.equal({
            released: true,
            releaseDate: testDate.toISOString(),
          });
          return {
            self: 'https://test-jira.atlassian.net/rest/api/3/version/10000',
            id: '10000',
            name: 'v4.167.0',
            archived: false,
            released: true,
            releaseDate: '2025-06-30',
            projectId: 10001,
          };
        });

      // when
      const result = await finalize(versionId);

      // then
      expect(result).to.be.true;
      expect(loggerStub).not.to.have.been.called;
      dateStub.restore();
    });

    it('should handle version not found error', async function () {
      // given
      const versionId = '99999';

      nock('https://test-jira.atlassian.net')
        .put('/rest/api/3/version/99999')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('content-type', 'application/json')
        .reply(404, {
          errorMessages: ['The version with id 99999 does not exist.'],
          errors: {},
        });

      // when
      const result = await finalize(versionId);

      // then
      expect(result).to.be.undefined;
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle permission denied error', async function () {
      // given
      const versionId = '10000';

      nock('https://test-jira.atlassian.net')
        .put('/rest/api/3/version/10000')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('content-type', 'application/json')
        .reply(403, {
          errorMessages: ['You do not have permission to edit versions for this project.'],
          errors: {},
        });

      // when
      const result = await finalize(versionId);

      // then
      expect(result).to.be.undefined;
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle network connection error and log it', async function () {
      // given
      const versionId = '10000';

      nock('https://test-jira.atlassian.net')
        .put('/rest/api/3/version/10000')
        .replyWithError({ code: 'ECONNREFUSED', message: 'Connection refused' });

      // when
      await catchErr(finalize)(versionId);

      // then
      expect(loggerStub).to.have.been.calledOnce;
      expect(loggerStub.firstCall.args[0]).to.deep.include({
        event: 'Jira release',
        message: 'An error occurred',
        job: 'jira service',
        stack: 'finalize version',
      });
    });

    it('should handle malformed response gracefully', async function () {
      // given
      const versionId = '10000';

      nock('https://test-jira.atlassian.net')
        .put('/rest/api/3/version/10000')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('content-type', 'application/json')
        .reply(200, 'Invalid JSON response');

      // when
      const result = await finalize(versionId);

      // then
      expect(result).to.be.true; // La fonction retourne true si la requête est ok, peu importe le contenu
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle server error (500)', async function () {
      // given
      const versionId = '10000';

      nock('https://test-jira.atlassian.net')
        .put('/rest/api/3/version/10000')
        .matchHeader('authorization', 'Basic ' + btoa('integration-test-user:integration-test-token'))
        .matchHeader('content-type', 'application/json')
        .reply(500, {
          errorMessages: ['Internal server error'],
          errors: {},
        });

      // when
      const result = await finalize(versionId);

      // then
      expect(result).to.be.undefined;
      expect(loggerStub).not.to.have.been.called;
    });
  });

  describe('Real-world integration scenarios', function () {
    it('should handle complete release workflow', async function () {
      // given - Simuler un workflow complet de release
      const mockVersions = [
        {
          id: '10000',
          name: 'v4.167.0',
          released: false,
          projectId: 10001,
        },
        {
          id: '10001',
          name: 'v4.168.0',
          released: true,
          releaseDate: '2025-06-15',
          projectId: 10001,
        },
      ];

      // Mock getVersionList
      nock('https://test-jira.atlassian.net').get('/rest/api/3/project/PIX/versions').reply(200, mockVersions);

      // Mock finalize pour la version non releasée
      nock('https://test-jira.atlassian.net').put('/rest/api/3/version/10000').reply(200, {
        id: '10000',
        name: 'v4.167.0',
        released: true,
        releaseDate: '2025-06-30',
        projectId: 10001,
      });

      // when
      const versions = await getVersionList();
      const unreleased = versions.find((v) => !v.released);
      const finalizeResult = await finalize(unreleased.id);

      // then
      expect(versions).to.have.lengthOf(2);
      expect(unreleased.name).to.equal('v4.167.0');
      expect(finalizeResult).to.be.true;
      expect(loggerStub).not.to.have.been.called;
    });

    it('should handle rate limiting from Jira API', async function () {
      // given
      nock('https://test-jira.atlassian.net')
        .get('/rest/api/3/project/PIX/versions')
        .reply(429, {
          errorMessages: ['Rate limit exceeded. Try again later.'],
          errors: {},
        });

      // when
      const result = await getVersionList();

      // then
      expect(result).to.be.undefined;
      expect(loggerStub).not.to.have.been.called;
    });
  });
});
