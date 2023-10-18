const { expect, nock, sinon } = require('../../../../test-helper');
const { describe, it } = require('mocha');

const slackPostMessageService = require('../../../../../common/services/slack/surfaces/messages/post-message');
const githubService = require('../../../../../common/services/github');
const { submitReleaseTagSelection } = require('../../../../../run/services/slack/view-submissions');
const config = require('../../../../../config');

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

          const responseCompareWithConfigFile = {
            commits: [
              {
                sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
              },
            ],
            // files[].sha is sha of diff, not commit id
            files: [
              {
                sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
                filename: '1d/package-lock.json',
                status: 'modified',
              },
              {
                sha: '6dcb09b5b57875f334f61aebed695e2e4193db5e',
                filename: config.api.configFilename,
                status: 'modified', // TODO doit-on prendre en compte si deleted ?
              },
            ],
          };

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/compare/v4.37.1...v10.0.0')
            .reply(200, responseCompareWithConfigFile);

          const responseCommitWithConfigFile = {
            sha: '3f63810343fa706ef94c915a922ffc88c442e4e6',
            files: [
              {
                filename: config.api.configFilename,
              },
            ],
          };

          nock('https://api.github.com')
            .get('/repos/github-owner/github-repository/commits/3f63810343fa706ef94c915a922ffc88c442e4e6')
            .reply(200, responseCommitWithConfigFile);

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
