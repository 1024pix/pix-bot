const { expect, nock, sinon } = require('../../../../test-helper');
const { describe, it } = require('mocha');

const slackPostMessageService = require('../../../../../common/services/slack/surfaces/messages/post-message');
const githubService = require('../../../../../common/services/github');
const { submitReleaseTagSelection } = require('../../../../../run/services/slack/view-submissions');

describe('#submitReleaseTagSelection', () => {
  const payload = {
    view: {
      state: {
        values: {
          'deploy-release-tag': {
            'release-tag-value': {
              value: 'v10.0.0',
            },
          },
        },
      },
    },
  };

  context('when Pix API return a version', function () {
    context('when Github return files and commits', function () {
      context('when config file was not changed', function () {
        it('should call "openModalReleaseDeploymentConfirmation" with "hasConfigFileChanged" parameter at false', async function () {
          // given
          nock('https://api.pix.fr').get('/api').reply(200, { version: '4.37.1' });

          const responseWithoutConfigFile = {
            commits: [
              {
                sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
              },
            ],
            files: [
              {
                sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
                filename: '1d/package-lock.json',
                status: 'modified',
              },
            ],
          };

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/compare/v4.37.1...v10.0.0')
            .reply(200, responseWithoutConfigFile);

          // when
          const modal = await submitReleaseTagSelection(payload);

          // then
          const expectedResponse = {
            response_action: 'push',
            view: {
              title: {
                type: 'plain_text',
                text: 'Confirmation',
              },
              callback_id: 'release-deployment-confirmation',
              private_metadata: 'v10.0.0',
              submit: {
                type: 'plain_text',
                text: '🚀 Go !',
              },
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  text: {
                    type: 'mrkdwn',
                    text: "Vous vous apprêtez à déployer la version *v10.0.0* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?",
                  },
                  type: 'section',
                },
              ],
              type: 'modal',
            },
          };

          expect(modal).to.deep.equal(expectedResponse);
        });
      });

      context('when config file was changed', function () {
        it('should call "openModalReleaseDeploymentConfirmation" with "hasConfigFileChanged" parameter at true', async function () {
          // given
          nock('https://api.pix.fr').get('/api').reply(200, { version: '4.37.1' });

          const responseWithConfigFile = {
            commits: [
              {
                sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
              },
            ],
            files: [
              {
                sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
                filename: '1d/package-lock.json',
                status: 'modified',
              },
              {
                sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
                filename: 'api/src/shared/config.js',
                status: 'modified',
              },
            ],
          };

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/compare/v4.37.1...v10.0.0')
            .reply(200, responseWithConfigFile);

          sinon.stub(slackPostMessageService, 'postMessage').resolves('ok');
          sinon.stub(githubService, 'getPullRequestsDetailsByCommitShas').resolves([
            {
              html_url: 'http://hello.world',
              labels: ['cross-team', 'team-dev-com'],
            },
          ]);

          const { submitReleaseTagSelection } = require('../../../../../run/services/slack/view-submissions');

          // when
          const modal = await submitReleaseTagSelection(payload);

          // then
          const expectedResponse = {
            response_action: 'push',
            view: {
              title: {
                type: 'plain_text',
                text: 'Confirmation',
              },
              callback_id: 'release-deployment-confirmation',
              private_metadata: 'v10.0.0',
              submit: {
                type: 'plain_text',
                text: '🚀 Go !',
              },
              close: {
                type: 'plain_text',
                text: 'Annuler',
              },
              blocks: [
                {
                  text: {
                    text: ":warning: Il y a eu des ajout(s)/suppression(s) dans le fichier *config.js*. Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo PRODUCTION*.",
                    type: 'mrkdwn',
                  },
                  type: 'section',
                },
                {
                  text: {
                    text: "Vous vous apprêtez à déployer la version *v10.0.0* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?",
                    type: 'mrkdwn',
                  },
                  type: 'section',
                },
              ],
              type: 'modal',
            },
          };

          const message =
            ':warning: Il y a eu des ajout(s)/suppression(s) ' +
            '<https://github.com/1024pix/pix/compare/v4.37.1...v10.0.0|dans le fichier config.js>. ' +
            "Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo PRODUCTION*. " +
            'Les Pr et équipes concernées sont : <http://hello.world|cross-team,team-dev-com> ';

          expect(slackPostMessageService.postMessage).to.have.been.calledWith({
            message,
            channel: '#tech-releases',
          });
          expect(githubService.getPullRequestsDetailsByCommitShas).to.have.been.calledOnce;

          expect(modal).to.deep.equal(expectedResponse);
        });
      });
    });
  });
});

describe('#extractCommitShasOfConfigFile', () => {
  context('when config file is not present', function () {
    it('should return an empty array', function () {
      // given
      const files = [
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
          filename: '1d/package-lock.json',
          status: 'modified',
        },
      ];

      const { extractCommitShasOfConfigFile } = require('../../../../../run/services/slack/view-submissions');

      // when
      const result = extractCommitShasOfConfigFile(files);

      // then
      expect(result).is.empty;
    });
  });

  context('when there is one config file is in the list of files', function () {
    it('should return commit sha of the config file', function () {
      // given
      const files = [
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
          filename: '1d/package-lock.json',
          status: 'modified',
        },
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
          filename: 'api/src/shared/config.js',
          status: 'modified',
        },
      ];

      const { extractCommitShasOfConfigFile } = require('../../../../../run/services/slack/view-submissions');

      // when
      const result = extractCommitShasOfConfigFile(files);

      // then
      expect(result).to.deep.equal(['3f63810343fa706ef94c915a922ffc88c442e4e6']);
    });
  });

  context('when there is multiples config files is in the list of files', function () {
    it('should return commit sha of the config file', function () {
      // given
      const files = [
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
          filename: '1d/package-lock.json',
          status: 'modified',
        },
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
          filename: 'api/src/shared/config.js',
          status: 'modified',
        },
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e7',
          filename: 'api/src/shared/config.js',
          status: 'modified',
        },
        {
          sha: '3f63810343fa706ef94c915a922ffc88c442e4e8',
          filename: 'api/src/shared/config.js',
          status: 'modified',
        },
      ];

      const { extractCommitShasOfConfigFile } = require('../../../../../run/services/slack/view-submissions');

      // when
      const result = extractCommitShasOfConfigFile(files);

      // then
      expect(result).to.deep.equal([
        '3f63810343fa706ef94c915a922ffc88c442e4e6',
        '3f63810343fa706ef94c915a922ffc88c442e4e7',
        '3f63810343fa706ef94c915a922ffc88c442e4e8',
      ]);
    });
  });
});
