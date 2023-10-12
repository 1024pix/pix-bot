const {
    expect,
    nock,
    catchErr,
    sinon,
  } = require('../../../../test-helper');
const { describe, it } = require('mocha');

const { submitReleaseTagSelection } = require('../../../../../run/services/slack/view-submissions')


describe('#submitReleaseTagSelection', () => {
  const payload = {
    view: {
      state: {
        values: {
          'deploy-release-tag': {
            'release-tag-value': {
              value: '10.0.0',
            }
          }
        }
      }
    }
  };

  context('when Pix API return a version', function () {
    context('when Github return files and commits', function () {
      it.only('and config file was not changed', async function () {
        // given
        nock('https://api.pix.fr')
          .get('/api')
          .reply(200, { version: "4.37.1" });

        const responseWithoutConfigFile = {
          commits: [
            {
              sha: "3f63810343fa706ef94c915a922ffc88c442e4e6",
            }
          ],
          files: [
            {
              sha: "3f63810343fa706ef94c915a922ffc88c442e4e6",
              filename: "1d/package-lock.json",
              status: "modified",
            },
          ]
        };

        nock('https://api.github.com')
          .get('/repos/github-owner/github-repository/compare/v4.37.1...dev')
          .reply(200, responseWithoutConfigFile);

        // when
        const modal = await submitReleaseTagSelection(payload);

        // then
        expectedResponse = {
          response_action: 'push',
          view: {
            title: {
              type: 'plain_text',
              text: 'Confirmation'
            },
            callback_id: 'release-deployment-confirmation',
            private_metadata: '10.0.0',
            submit: {
              type: 'plain_text',
              text: '🚀 Go !'
            },
            close: {
              type: 'plain_text',
              text: 'Annuler'
            },
            blocks: [
              {
                text: {
                  type: 'mrkdwn',
                  text: "Vous vous apprêtez à déployer la version *10.0.0* en production. Il s'agit d'une opération critique. Êtes-vous sûr de vous ?"
                },
                type: 'section'
              }
            ],
            type: 'modal'
          }
        };

        expect(modal).to.deep.equal(expectedResponse);
      });
    });
  });
});
